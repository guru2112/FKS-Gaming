import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";
import {
  cancelExpiredBookings,
  completeExpiredSessions,
} from "@/lib/utils/bookingCleanup.js";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const [cancelled, completed] = await Promise.all([
      cancelExpiredBookings(),
      completeExpiredSessions(),
    ]);

    return NextResponse.json({
      cancelled,
      completed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
