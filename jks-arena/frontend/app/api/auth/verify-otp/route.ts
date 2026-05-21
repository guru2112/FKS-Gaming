import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      resetOTP: otp,
      resetOTPExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "OTP Verified. Now set your new password.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
