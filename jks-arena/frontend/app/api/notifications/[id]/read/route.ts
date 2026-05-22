import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Notification from "@/models/Notification.js";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    await Notification.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { isRead: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
