import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { createToken } from "@/lib/utils/token";
import { handleApiError } from "@/lib/errorHandler";
import Admin from "@/models/Admin.js";
import User from "@/models/User.js";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check Admin first
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (admin) {
      const match = await bcrypt.compare(password, admin.passwordHash);
      if (match) {
        const token = createToken({ _id: String(admin._id), email: admin.email }, "admin");
        return NextResponse.json({
          token,
          role: "admin",
          user: {
            id: String(admin._id),
            name: admin.name,
            email: admin.email,
            avatarUrl: admin.avatarUrl,
            topbarUrl: admin.topbarUrl,
          },
        });
      }
    }

    // Check User
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (match) {
        const token = createToken({ _id: String(user._id), email: user.email }, "user");
        return NextResponse.json({
          token,
          role: "user",
          user: {
            id: String(user._id),
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            topbarUrl: user.topbarUrl,
          },
        });
      }
    }

    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
