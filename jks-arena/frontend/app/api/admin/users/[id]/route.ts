import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User.js";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "User deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
