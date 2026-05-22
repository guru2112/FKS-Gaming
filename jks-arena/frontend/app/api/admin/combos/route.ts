import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Combo from "@/models/Combo.js";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const combos = await Combo.find().sort({ createdAt: -1 });
    return NextResponse.json({ combos });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { name, items, price, durationHours, description, isActive } =
      await req.json();

    const combo = await Combo.create({
      name,
      items,
      price,
      durationHours,
      description,
      isActive,
    });

    return NextResponse.json({ combo }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
