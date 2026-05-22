import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const { bookingUpdates, promotions, reminders } = await req.json();

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.notifications) user.notifications = { bookingUpdates: true, promotions: true, reminders: true };
    if (bookingUpdates !== undefined) user.notifications.bookingUpdates = bookingUpdates;
    if (promotions !== undefined) user.notifications.promotions = promotions;
    if (reminders !== undefined) user.notifications.reminders = reminders;

    await user.save();

    return NextResponse.json({
      message: "Notification preferences updated successfully!",
      notifications: user.notifications,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
