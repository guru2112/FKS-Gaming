import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Booking from "@/models/Booking.js";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const date = req.nextUrl.searchParams.get("date");
    const device = req.nextUrl.searchParams.get("device");

    if (!date) {
      return NextResponse.json(
        { message: "Date is required." },
        { status: 400 }
      );
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const query: Record<string, unknown> = {
      status: { $ne: "cancelled" },
      slotStart: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    if (device && device !== "ALL") {
      query.device = String(device).toUpperCase();
    }

    const bookings = await Booking.find(query)
      .select("device slotStart slotEnd")
      .sort({ device: 1, slotStart: 1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    return handleApiError(err);
  }
}
