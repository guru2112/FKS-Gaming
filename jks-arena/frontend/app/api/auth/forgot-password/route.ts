import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";
import { sendMail } from "@/lib/utils/mailer.js";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with that email." },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendMail({
      to: user.email,
      subject: "JKS Arena - Password Reset OTP",
      html: `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>This OTP expires in 10 minutes.</p>`,
    });

    return NextResponse.json({ message: "OTP sent!" });
  } catch (err) {
    return handleApiError(err);
  }
}
