import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (err) {
    return handleApiError(err);
  }
}
