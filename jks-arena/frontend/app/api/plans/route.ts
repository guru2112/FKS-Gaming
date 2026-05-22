import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Plan from "@/models/Plan.js";

const defaultPlans = [
  {
    name: "Free",
    priceMonthly: 0,
    perks: ["Standard rigs", "Cafe access"],
  },
  {
    name: "Pro",
    priceMonthly: 1499,
    perks: ["Priority rigs", "Tournament entries", "10% cafe discount"],
  },
  {
    name: "VIP",
    priceMonthly: 2999,
    perks: ["Private room hours", "Dedicated support", "20% cafe discount"],
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const count = await Plan.countDocuments();
    if (count === 0) {
      await Plan.insertMany(defaultPlans);
    }

    const plans = await Plan.find({ isActive: true })
      .sort({ priceMonthly: 1 })
      .lean();

    return NextResponse.json({ plans });
  } catch (err) {
    return handleApiError(err);
  }
}
