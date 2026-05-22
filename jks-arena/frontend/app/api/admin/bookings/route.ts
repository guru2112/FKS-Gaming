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

    const bookings = await Booking.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ bookings });
  } catch (err) {
    return handleApiError(err);
  }
}
