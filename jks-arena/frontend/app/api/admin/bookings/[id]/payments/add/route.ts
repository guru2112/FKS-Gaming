import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Booking from "@/models/Booking.js";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { message: "Request body is required." },
        { status: 400 }
      );
    }

    const { method, amount } = body as { method?: string; amount?: number };
    console.log("[payments/add] id:", id, "body:", body);

    const normalizedMethod = String(method || "").toLowerCase();
    if (normalizedMethod !== "cash" && normalizedMethod !== "online") {
      return NextResponse.json(
        { message: 'method must be "cash" or "online".' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { message: "amount must be a positive number." },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    console.log("[payments/add] before push, payments:", JSON.stringify(booking.payments));

    // Ensure payments is a proper array
    if (!Array.isArray(booking.payments)) {
      booking.payments = [];
    }

    // Add payment entry
    booking.payments.push({
      method: normalizedMethod,
      amount,
      collectedAt: new Date(),
    });

    // Force Mongoose to detect the array change
    booking.markModified("payments");

    // Recompute summary fields
    const totalCollected = booking.payments.reduce(
      (sum: number, p: { amount: number }) => sum + (p.amount || 0),
      0
    );
    booking.amountPaid = totalCollected;
    booking.paymentMethod = normalizedMethod;
    booking.paymentStatus = totalCollected >= booking.totalPrice ? "paid" : "partial";

    console.log("[payments/add] saving, payments:", JSON.stringify(booking.payments), "totalCollected:", totalCollected);

    await booking.save();

    console.log("[payments/add] saved successfully, payments count:", booking.payments.length);

    return NextResponse.json({
      message: `₹${amount} (${normalizedMethod}) added. Total: ₹${totalCollected}/${booking.totalPrice}.`,
      booking,
    });
  } catch (err) {
    console.error("[payments/add] error:", err);
    return handleApiError(err);
  }
}
