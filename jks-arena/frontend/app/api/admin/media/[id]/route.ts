import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import MediaItem from "@/models/MediaItem.js";
import { uploadImageBuffer, deleteImage } from "@/lib/utils/cloudinary.js";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const item = await MediaItem.findById(id);
    if (!item) {
      return NextResponse.json(
        { message: "Media item not found." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const update: Record<string, unknown> = {};

    if (body.name !== undefined) update.name = body.name;
    if (body.description !== undefined) update.description = body.description;
    if (body.category !== undefined) update.category = body.category;
    if (body.gameName !== undefined) update.gameName = body.gameName;
    if (body.view !== undefined) update.view = body.view;
    if (body.profileImageType !== undefined)
      update.profileImageType = body.profileImageType;
    if (body.facilityType !== undefined) update.facilityType = body.facilityType;
    if (body.dashboardType !== undefined)
      update.dashboardType = body.dashboardType;

    // If new file provided, upload and replace
    if (body.file && body.file.startsWith("data:image")) {
      const buffer = Buffer.from(body.file.split(",")[1], "base64");
      const uploadResult = await uploadImageBuffer(buffer, {
        folder: `Photos/${body.category || item.category}`,
      });

      // Delete old image
      await deleteImage(item.public_id);

      update.secure_url = uploadResult.secure_url;
      update.public_id = uploadResult.public_id;
    }

    const updated = await MediaItem.findByIdAndUpdate(id, update, {
      new: true,
    });

    return NextResponse.json({ item: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const item = await MediaItem.findById(id);
    if (!item) {
      return NextResponse.json(
        { message: "Media item not found." },
        { status: 404 }
      );
    }

    await deleteImage(item.public_id);
    await MediaItem.deleteOne({ _id: id });

    return NextResponse.json({ message: "Media item deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
