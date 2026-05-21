import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const user = await User.findById(auth.userId).select("name email");

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currentPlan: null,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
