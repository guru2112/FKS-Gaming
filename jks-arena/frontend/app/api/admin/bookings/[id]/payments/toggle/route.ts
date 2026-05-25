import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Booking from "@/models/Booking.js";

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

    const { paymentStatus } = body as { paymentStatus?: string };

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    if (paymentStatus === "paid") {
      // Admin considers this paid — use actual collected amount
      booking.paymentStatus = "paid";
      if (!booking.amountPaid || booking.amountPaid === 0) {
        booking.amountPaid = booking.totalPrice;
      }
    } else {
      booking.paymentStatus = "partial";
    }

    await booking.save();

    return NextResponse.json({
      message: `Payment status set to ${booking.paymentStatus}.`,
      booking,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
