import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";
import Booking from "@/models/Booking.js";
import Combo from "@/models/Combo.js";

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const [users, bookings, combos] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Combo.countDocuments(),
    ]);

    return NextResponse.json({ users, bookings, combos });
  } catch (err) {
    return handleApiError(err);
  }
}
