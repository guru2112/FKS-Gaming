import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Notification from "@/models/Notification.js";

export async function PATCH(req: NextRequest) {
  await connectDB();
  try {
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    await Notification.updateMany(
      { userId: auth.userId, isRead: false },
      { isRead: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
