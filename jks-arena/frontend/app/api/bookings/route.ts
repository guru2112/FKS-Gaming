import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { authenticate } from "@/lib/server-auth";
import { handleApiError } from "@/lib/errorHandler";
import Booking from "@/models/Booking.js";
import User from "@/models/User.js";
import Notification from "@/models/Notification.js";

import { normalizeDevice, assertDeviceAvailable } from "@/lib/utils/sessionAvailability.js";
import { sendMail } from "@/lib/utils/mailer.js";
import { createQrPngBuffer } from "@/lib/utils/qrCode.js";
import { buildBookingPdf } from "@/lib/utils/bookingPdf.js";
import { sendPushToUser } from "@/lib/utils/pushNotifications.js";

const DEVICE_RATES: Record<string, number> = { PS1: 60, PS2: 60, PS3: 60, SIM1: 100 };

// =========================================================
// GET - Fetch user bookings
// =========================================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const now = new Date();

    // Auto-complete past-due "upcoming" bookings
    await Booking.updateMany(
      {
        userId: auth.userId,
        status: "upcoming",
        slotEnd: { $exists: true, $lt: now },
      },
      {
        $set: {
          status: "completed",
          sessionStatus: "completed",
        },
      }
    );

    const bookings = await Booking.find({ userId: auth.userId })
      .sort({ slotStart: -1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    return handleApiError(err);
  }
}

// =========================================================
// POST - Create a new booking
// =========================================================

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const {
      device,
      slotStart,
      durationHours,
      players,
      game,
      contactNumber,
      companions,
      userName,
    } = body;

    // Validation
    if (!device || !slotStart || !durationHours || !players || !contactNumber) {
      return NextResponse.json(
        { message: "Missing booking fields." },
        { status: 400 }
      );
    }

    const contact = String(contactNumber).trim();
    const normalizedDevice = normalizeDevice(device);
    const perHeadRate = DEVICE_RATES[normalizedDevice];

    if (!perHeadRate) {
      return NextResponse.json(
        { message: "Invalid device selected." },
        { status: 400 }
      );
    }

    const playersCount = Number(players);
    const duration = Number(durationHours);
    const start = new Date(slotStart);
    const slotEnd = new Date(start.getTime() + duration * 60 * 60 * 1000);

    // QR + Expiry
    const qrId = crypto.randomUUID();
    const expiryTime = slotEnd;

    // Check slot conflict
    try {
      await assertDeviceAvailable({
        device: normalizedDevice,
        slotStart: start,
        slotEnd,
      });
    } catch (err: unknown) {
      const slotErr = err as { status?: number; message?: string };
      if (slotErr && slotErr.status === 409) {
        return NextResponse.json(
          { message: slotErr.message },
          { status: 409 }
        );
      }
      throw err;
    }

    // Total price
    const totalPrice = playersCount * perHeadRate * duration;

    // Create booking
    const booking = await Booking.create({
      source: "online",
      sessionStatus: "scheduled",
      walkInCustomer: false,
      userId: auth.userId,
      userName: userName ? String(userName).trim() : "Player",
      userContact: contact,
      qrId,
      expiryTime,
      game: game ? String(game).trim() : "",
      device: normalizedDevice as "PS1" | "PS2" | "PS3" | "SIM1",
      slotStart: start,
      slotEnd,
      inTime: start,
      outTime: slotEnd,
      durationHours: duration,
      players: playersCount,
      contactNumber: contact,
      companions: companions || [],
      perHeadRate,
      totalPrice,
      rig: normalizedDevice,
    });

    // Create notification
    const notification = await Notification.create({
      userId: auth.userId,
      title: "Booking Confirmed",
      message: `Your ${booking.device} session has been booked successfully.`,
      type: "booking",
      link: "/dashboard",
    });

    // Best-effort push notification
    await sendPushToUser(auth.userId, {
      title: notification.title,
      body: notification.message,
      data: {
        type: notification.type,
        link: notification.link,
        notificationId: notification._id,
      },
    });

    // Get user for email
    const user = await User.findById(auth.userId)
      .select("name email notifications")
      .lean();

    // Fire-and-forget email
    const emailUser = user as { name: string; email: string; notifications?: { bookingUpdates?: boolean } } | null;

    if (
      emailUser?.email &&
      emailUser?.notifications?.bookingUpdates !== false
    ) {
      (async () => {
        try {
          const frontendUrl =
            process.env.FRONTEND_URL ||
            process.env.CLIENT_ORIGIN ||
            "https://fks-gaming.vercel.app";

          const qrViewUrl = `${frontendUrl}/qr/${qrId}`;
          const qrPng = await createQrPngBuffer(qrViewUrl);

          const pdfBuffer = await buildBookingPdf({
            booking,
            user: emailUser,
            qrPng,
          });

          const from = process.env.MAIL_FROM || process.env.MAIL_USERNAME;

          await sendMail({
            from,
            to: emailUser.email,
            subject: "Your JKS Arena Access Pass",
            html: `
              <div style="font-family:Arial,sans-serif;padding:20px;">
                <h2 style="color:#ff6b35;">Booking Confirmed</h2>
                <p>Hi <strong>${emailUser.name}</strong>,</p>
                <p>Your booking has been successfully confirmed.</p>
                <div style="margin-top:20px;padding:15px;border:1px solid #eee;border-radius:10px;background:#fafafa;">
                  <p><strong>Device:</strong> ${booking.device}</p>
                  <p><strong>Players:</strong> ${booking.players}</p>
                  <p><strong>Duration:</strong> ${booking.durationHours} Hour(s)</p>
                  <p><strong>Total:</strong> ₹${booking.totalPrice}</p>
                </div>
                <p style="margin-top:20px;">Your QR Pass:</p>
                <a href="${qrViewUrl}" style="display:inline-block;padding:12px 20px;background:#ff6b35;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">View QR Pass</a>
                <p style="margin-top:30px;color:#777;font-size:12px;">JKS Arena • Gaming & Simulator Lounge</p>
              </div>
            `,
            attachments: [
              {
                filename: `booking-${qrId}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });

          console.log(
            `✅ Booking email sent to ${emailUser.email} for booking ${qrId}`
          );
        } catch (emailErr) {
          console.error(
            `❌ Email failed for ${emailUser?.email || "unknown"} (booking ${qrId}, device ${booking.device}):`,
            (emailErr as Error)?.message || emailErr
          );
        }
      })();
    }

    return NextResponse.json(
      {
        booking,
        emailQueued: !!(
          emailUser?.email &&
          emailUser?.notifications?.bookingUpdates !== false
        ),
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
