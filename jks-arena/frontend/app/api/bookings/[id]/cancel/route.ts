import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Booking from "@/models/Booking.js";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const booking = await Booking.findOne({
      _id: id,
      userId: auth.userId,
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.status !== "upcoming") {
      return NextResponse.json(
        { message: "Only upcoming bookings can be cancelled." },
        { status: 400 }
      );
    }

    // Must be at least 30 minutes before slot start
    const now = Date.now();
    const cutoff =
      new Date(booking.slotStart).getTime() - 30 * 60 * 1000;

    if (now >= cutoff) {
      return NextResponse.json(
        {
          message:
            "Too late to cancel. You can only cancel up to 30 minutes before your session.",
        },
        { status: 400 }
      );
    }

    booking.status = "cancelled";
    booking.sessionStatus = "cancelled";
    await booking.save();

    return NextResponse.json({
      booking,
      message: "Booking cancelled successfully.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
