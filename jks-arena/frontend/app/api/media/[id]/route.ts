import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import MediaItem from "@/models/MediaItem.js";
import cloudinary from "@/lib/utils/cloudinary.js";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const item = await MediaItem.findById(id);
    if (!item) {
      return NextResponse.json({ message: "Media not found." }, { status: 404 });
    }

    await cloudinary.uploader.destroy(item.public_id);
    await MediaItem.deleteOne({ _id: id });

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
