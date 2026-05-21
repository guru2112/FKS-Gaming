import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import {
  normalizeDevice,
  assertDeviceAvailable,
} from "@/lib/utils/sessionAvailability.js";
import Booking from "@/models/Booking.js";

const DEVICE_RATES: Record<string, number> = {
  PS1: 60,
  PS2: 60,
  PS3: 60,
  SIM1: 100,
};

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const {
      customerName,
      phoneNumber,
      device,
      game,
      players,
      companions,
      inTime,
      outTime,
      paymentMethod,
      amountPaid,
    } = body;

    // Validate required fields
    if (!customerName || !phoneNumber || !device || !players || !outTime) {
      return NextResponse.json(
        { message: "Missing required fields: customerName, phoneNumber, device, players, outTime." },
        { status: 400 }
      );
    }

    const normalizedDevice = normalizeDevice(device);

    if (typeof players !== "number" || players < 1) {
      return NextResponse.json(
        { message: "players must be at least 1." },
        { status: 400 }
      );
    }

    // Parse start/end times
    const now = new Date();
    const startDate = inTime ? new Date(inTime) : now;
    const endDate = new Date(outTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format for inTime or outTime." },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { message: "outTime must be after inTime." },
        { status: 400 }
      );
    }

    // Compute duration in hours
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;

    // Check device availability
    await assertDeviceAvailable({
      device: normalizedDevice,
      slotStart: startDate,
      slotEnd: endDate,
    });

    // Rate calculation
    const perHeadRate = DEVICE_RATES[normalizedDevice] || 60;
    const totalPrice = Math.round(players * perHeadRate * durationHours);

    // Validate companions
    const companionsList = Array.isArray(companions) ? companions : [];
    if (companionsList.length >= players) {
      return NextResponse.json(
        { message: "Number of companions must be less than players." },
        { status: 400 }
      );
    }

    // Payment validation
    const validPaymentMethod = paymentMethod
      ? String(paymentMethod).toLowerCase()
      : "cash";
    if (validPaymentMethod !== "cash" && validPaymentMethod !== "online") {
      return NextResponse.json(
        { message: 'paymentMethod must be "cash" or "online".' },
        { status: 400 }
      );
    }

    const paid = Number(amountPaid) || 0;

    // Determine session status based on current time
    let sessionStatus: string;
    let legacyStatus: string;

    if (now < startDate) {
      sessionStatus = "scheduled";
      legacyStatus = "upcoming";
    } else if (now >= startDate && now <= endDate) {
      sessionStatus = "active";
      legacyStatus = "active";
    } else {
      sessionStatus = "completed";
      legacyStatus = "completed";
    }

    const paymentStatus = paid >= totalPrice ? "paid" : "partial";

    const booking = await Booking.create({
      source: "offline" as const,
      walkInCustomer: true,
      qrId: crypto.randomUUID(),
      userName: customerName,
      userContact: phoneNumber,
      contactNumber: phoneNumber,
      device: normalizedDevice as "PS1" | "PS2" | "PS3" | "SIM1",
      slotStart: startDate,
      slotEnd: endDate,
      expiryTime: endDate,
      inTime: startDate,
      outTime: endDate,
      durationHours,
      game: game || "",
      players,
      companions: companionsList,
      perHeadRate,
      totalPrice,
      paymentMethod: validPaymentMethod,
      amountPaid: paid,
      paymentStatus: paymentStatus as "paid" | "partial" | undefined,
      sessionStatus: sessionStatus as "scheduled" | "active" | "completed" | "cancelled",
      status: legacyStatus as "upcoming" | "active" | "completed" | "cancelled" | "no-show",
      actualStartTime: sessionStatus === "active" ? now : undefined,
    });

    return NextResponse.json(
      { message: "Session started.", session: booking },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
