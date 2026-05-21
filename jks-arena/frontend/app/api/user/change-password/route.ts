import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";

export async function PUT(req: NextRequest) {
  await connectDB();
  try {
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      return NextResponse.json(
        { message: "New password must be different from current password" },
        { status: 400 }
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json({
      message: "Password updated successfully!",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
