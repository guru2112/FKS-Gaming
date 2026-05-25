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

    // Get today's date range in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const todayStart = new Date(istNow);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(istNow);
    todayEnd.setUTCHours(23, 59, 59, 999);

    // Convert back to UTC for query
    const startUTC = new Date(todayStart.getTime() - istOffset);
    const endUTC = new Date(todayEnd.getTime() - istOffset);

    const bookings = await Booking.find({
      slotStart: { $gte: startUTC, $lte: endUTC },
      status: { $in: ["upcoming", "active", "completed"] },
    })
      .select("userName userContact device slotStart slotEnd status players durationHours")
      .sort({ slotStart: 1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    return handleApiError(err);
  }
}
