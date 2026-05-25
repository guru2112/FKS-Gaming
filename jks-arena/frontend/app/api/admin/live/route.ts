import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Booking from "@/models/Booking.js";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const liveBookings = await Booking.find({ status: "active" })
      .select(
        "userName device slotStart slotEnd durationHours players perHeadRate paymentStatus amountPaid"
      )
      .lean();

    return NextResponse.json({ liveBookings });
  } catch (err) {
    return handleApiError(err);
  }
}
