import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import PushToken from "@/models/PushToken.js";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const { token } = await req.json();

    try {
      await PushToken.findOneAndUpdate(
        { userId: auth.userId },
        { userId: auth.userId, token, platform: "web" },
        { upsert: true, new: true }
      );
    } catch (err) {
      const error = err as { code?: number };
      if (error.code === 11000) {
        return NextResponse.json({ success: true });
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
