import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";

export async function PUT(req: NextRequest) {
  await connectDB();
  try {
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { name, email, avatarUrl, topbarUrl } = body;

    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (topbarUrl !== undefined) updates.topbarUrl = topbarUrl;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: auth.userId } });
      if (existing) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 409 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      auth.userId,
      { $set: updates },
      { new: true, runValidators: false }
    ).lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;

    const response = NextResponse.json({
      message: "Profile updated successfully!",
      user: safeUser,
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
