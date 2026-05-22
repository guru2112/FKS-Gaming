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
    const { paymentMethod } = await req.json();

    const normalized = String(paymentMethod || "").toLowerCase();
    if (normalized !== "cash" && normalized !== "online") {
      return NextResponse.json(
        { message: 'paymentMethod must be "cash" or "online".' },
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

    booking.paymentMethod = normalized;

    // Sync paymentStatus based on amountPaid vs totalPrice
    if (booking.totalPrice && booking.amountPaid >= booking.totalPrice) {
      booking.paymentStatus = "paid";
    } else {
      booking.paymentStatus = "partial";
    }

    await booking.save();

    return NextResponse.json({
      message: "Payment method updated.",
      booking,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
