import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { createToken } from "@/lib/utils/token";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
    });

    const token = createToken({ _id: String(user._id), email: user.email }, "user");

    return NextResponse.json(
      {
        token,
        role: "user",
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          topbarUrl: user.topbarUrl,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
