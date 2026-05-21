import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import MediaItem from "@/models/MediaItem.js";
import { uploadImageBuffer } from "@/lib/utils/cloudinary.js";

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const items = await MediaItem.find().sort({ createdAt: -1 });
    return NextResponse.json({ items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { name, category, gameName, file } = await req.json();

    if (!file || !file.startsWith("data:image")) {
      return NextResponse.json(
        { message: "File must be a base64-encoded image string." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(file.split(",")[1], "base64");
    const result = await uploadImageBuffer(buffer, {
      folder: `Photos/${category}`,
    });

    const item = await MediaItem.create({
      name,
      category,
      gameName,
      secure_url: result.secure_url,
      public_id: result.public_id,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
