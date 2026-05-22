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

    const dateParam = req.nextUrl.searchParams.get("date");
    let startOfDay: Date;
    let endOfDay: Date;

    if (dateParam) {
      const d = new Date(dateParam);
      startOfDay = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
      );
      endOfDay = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999)
      );
    } else {
      const now = new Date();
      startOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
      );
      endOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
      );
    }

    const sessions = await Booking.find({
      slotStart: { $lt: endOfDay },
      slotEnd: { $gte: startOfDay },
    })
      .select(
        "source sessionStatus walkInCustomer userName userContact contactNumber device slotStart slotEnd inTime outTime durationHours players game companions perHeadRate totalPrice paymentMethod amountPaid paymentStatus status actualStartTime createdAt"
      )
      .sort({ slotStart: 1 });

    return NextResponse.json({ sessions });
  } catch (err) {
    return handleApiError(err);
  }
}
