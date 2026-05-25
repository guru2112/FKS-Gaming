import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Booking from "@/models/Booking.js";

const BUFFER_MS = 20 * 60 * 1000;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // Empty body
    }
    const { extraMinutes } = body;

    if (!extraMinutes || typeof extraMinutes !== "number" || extraMinutes <= 0) {
      return NextResponse.json(
        { message: "extraMinutes must be a positive number." },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.status !== "active") {
      return NextResponse.json(
        { message: "Only active sessions can be extended." },
        { status: 400 }
      );
    }

    const currentEnd = new Date(booking.slotEnd);
    const newEnd = new Date(currentEnd.getTime() + extraMinutes * 60 * 1000);

    // Check for conflict with next booking on same device
    const nextBooking = await Booking.findOne({
      device: booking.device,
      status: { $in: ["upcoming", "active"] },
      _id: { $ne: booking._id },
      slotStart: { $gt: currentEnd },
    }).sort({ slotStart: 1 }).lean();

    if (nextBooking) {
      const latestAllowed = new Date(nextBooking.slotStart.getTime() - BUFFER_MS);
      if (newEnd > latestAllowed) {
        const nextTime = new Date(nextBooking.slotStart).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return NextResponse.json(
          {
            message: `Cannot extend — next booking (${nextBooking.userName}) starts at ${nextTime}.`,
          },
          { status: 409 }
        );
      }
    }

    // Calculate additional cost
    const extraHours = extraMinutes / 60;
    const perHeadRate = booking.perHeadRate || 60;
    const additionalCost = Math.round(booking.players * perHeadRate * extraHours);

    // Update fields
    booking.slotEnd = newEnd;
    booking.outTime = newEnd;
    booking.expiryTime = newEnd;

    // Recompute total duration from actual start
    const actualStart = booking.actualStartTime
      ? new Date(booking.actualStartTime)
      : new Date(booking.slotStart);
    const durationMs = newEnd.getTime() - actualStart.getTime();
    booking.durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;

    booking.totalPrice = (booking.totalPrice || 0) + additionalCost;

    // Sync payment status
    if (booking.amountPaid >= booking.totalPrice) {
      booking.paymentStatus = "paid";
    } else {
      booking.paymentStatus = "partial";
    }

    await booking.save();

    return NextResponse.json({
      message: `Extended by ${extraMinutes} minutes.`,
      newSlotEnd: newEnd.toISOString(),
      additionalCost,
      totalPrice: booking.totalPrice,
      paymentStatus: booking.paymentStatus,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
