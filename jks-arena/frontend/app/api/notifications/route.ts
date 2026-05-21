import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Notification from "@/models/Notification.js";

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const notifications = await Notification.find({ userId: auth.userId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ notifications });
  } catch (err) {
    return handleApiError(err);
  }
}
