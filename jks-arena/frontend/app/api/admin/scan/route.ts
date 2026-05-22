import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Booking from "@/models/Booking.js";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: "QR token is required." },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({ qrId: token }).populate("userId");
    if (!booking) {
      return NextResponse.json(
        { message: "Invalid QR code." },
        { status: 404 }
      );
    }

    const now = new Date();

    // Not started yet
    if (booking.slotStart > now) {
      return NextResponse.json(
        { message: "This session has not started yet." },
        { status: 400 }
      );
    }

    // Expired
    if (booking.expiryTime && booking.expiryTime < now) {
      return NextResponse.json(
        { message: "This QR code has expired." },
        { status: 410 }
      );
    }

    // Already active
    if (booking.status === "active") {
      return NextResponse.json(
        { message: "This rig is already activated." },
        { status: 409 }
      );
    }

    // Already completed
    if (booking.status === "completed") {
      return NextResponse.json(
        { message: "This session has already been completed." },
        { status: 410 }
      );
    }

    booking.status = "active";
    booking.sessionStatus = "active";
    booking.actualStartTime = now;
    await booking.save();

    return NextResponse.json({
      message: "Success! Rig activated.",
      booking,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
