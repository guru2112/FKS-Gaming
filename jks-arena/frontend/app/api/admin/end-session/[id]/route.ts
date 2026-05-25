import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Booking from "@/models/Booking.js";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.status !== "active") {
      return NextResponse.json(
        { message: "Only active sessions can be ended." },
        { status: 400 }
      );
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // Empty or invalid body — use defaults
    }
    const { outTime, amountPaid, paymentMethod } = body as { outTime?: string; amountPaid?: number; paymentMethod?: string };

    const end = outTime ? new Date(outTime) : new Date();

    booking.status = "completed";
    booking.sessionStatus = "completed";
    booking.outTime = end;
    booking.slotEnd = end;
    booking.expiryTime = end;

    // For offline sessions, recompute duration and price from actual times
    if (booking.source === "offline" && booking.actualStartTime) {
      const start = new Date(booking.actualStartTime);
      const durationMs = end.getTime() - start.getTime();
      const newDuration = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
      booking.durationHours = newDuration;

      if (booking.perHeadRate && booking.players) {
        booking.totalPrice = Math.round(
          booking.players * booking.perHeadRate * newDuration
        );
      }
    }

    // Update payment fields if provided
    if (amountPaid !== undefined) {
      booking.amountPaid = Number(amountPaid);
    }
    if (paymentMethod) {
      const normalized = String(paymentMethod).toLowerCase();
      if (normalized === "cash" || normalized === "online") {
        booking.paymentMethod = normalized;
      }
    }

    // Sync paymentStatus
    if (booking.totalPrice && booking.amountPaid >= booking.totalPrice) {
      booking.paymentStatus = "paid";
    } else {
      booking.paymentStatus = "partial";
    }

    await booking.save();

    return NextResponse.json({
      message: "Session completed successfully.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
