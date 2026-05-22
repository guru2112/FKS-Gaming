import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { success: false, message: "Email, OTP, and new password are required." },
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

    // Hash new password and clear OTP fields
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    return NextResponse.json({ message: "Success! Password changed." });
  } catch (err) {
    return handleApiError(err);
  }
}
