const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Plan = require("../models/Plan");
const { authenticate } = require("../middleware/auth");
const { sendMail } = require("../utils/mailer");
const { createQrPngBuffer, createQrToken } = require("../utils/qrCode");
const { buildBookingPdf } = require("../utils/bookingPdf");

const router = express.Router();

const DEVICE_RATES = {
  PS1: 60,
  PS2: 60,
  PS3: 60,
  SIM1: 100,
};

const DEFAULT_PLANS = [
  {
    name: "Starter",
    priceMonthly: 199,
    perks: ["Priority slots", "Free game swap"],
    isActive: true,
  },
  {
    name: "Pro",
    priceMonthly: 399,
    perks: ["Priority slots", "Free game swap", "Extended sessions"],
    isActive: true,
  },
  {
    name: "Elite",
    priceMonthly: 699,
    perks: ["VIP rig access", "Priority slots", "Guest passes"],
    isActive: true,
  },
];

async function ensureDefaultPlans() {
  const existing = await Plan.countDocuments();
  if (existing > 0) return;
  await Plan.insertMany(DEFAULT_PLANS);
}

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate("planId")
      .select("name email planId")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currentPlan: user.planId || null,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/plans", authenticate, async (req, res, next) => {
  try {
    await ensureDefaultPlans();
    const plans = await Plan.find({ isActive: true })
      .sort({ priceMonthly: 1 })
      .lean();
    return res.json({ plans });
  } catch (err) {
    return next(err);
  }
});

router.get("/bookings", authenticate, async (req, res, next) => {
  try {
    const now = new Date();
    await Booking.updateMany(
      {
        userId: req.userId,
        status: "upcoming",
        slotEnd: { $exists: true, $lt: now },
      },
      { $set: { status: "completed" } }
    );

    const bookings = await Booking.find({ userId: req.userId })
      .sort({ slotStart: -1 })
      .lean();

    return res.json({ bookings });
  } catch (err) {
    return next(err);
  }
});

router.post("/bookings", authenticate, async (req, res, next) => {
  try {
    const { 
      device, 
      slotStart, 
      durationHours, 
      players, 
      game, 
      contactNumber, 
      userName, // Added this field
      companions 
    } = req.body;

    if (!device || !slotStart || !durationHours || !players || !contactNumber || !userName) {
      return res.status(400).json({ message: "Missing required booking fields (including name and contact)." });
    }

    const contact = String(contactNumber).trim();
    const nameStr = String(userName).trim();

    const normalizedDevice = String(device).toUpperCase();
    const perHeadRate = DEVICE_RATES[normalizedDevice];

    if (!perHeadRate) {
      return res.status(400).json({ message: "Invalid device selected." });
    }

    const playersCount = Number(players);
    const companionsList = Array.isArray(companions) ? companions : [];

    // Duration and Time parsing
    const duration = Number(durationHours);
    const start = new Date(slotStart);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid slotStart time." });
    }
    const slotEnd = new Date(start.getTime() + duration * 60 * 60 * 1000);

    // Conflict Check
    const conflict = await Booking.findOne({
      device: normalizedDevice,
      status: { $ne: "cancelled" },
      slotStart: { $lt: slotEnd },
      slotEnd: { $gt: start },
    }).lean();

    if (conflict) {
      return res.status(409).json({ message: "Selected slot is already booked." });
    }

    const totalPrice = playersCount * perHeadRate * duration;

    // Create Booking with the new required fields
    const booking = await Booking.create({
      userId: req.userId,
      userName: nameStr,
      userContact: contact, // Mapping contactNumber to userContact if that is your schema
      game: game ? String(game).trim() : "",
      device: normalizedDevice,
      slotStart: start,
      slotEnd,
      durationHours: duration,
      players: playersCount,
      contactNumber: contact, 
      companions: companionsList,
      perHeadRate,
      totalPrice,
      rig: normalizedDevice,
    });

    const user = await User.findById(req.userId).select("name email").lean();

    if (user?.email) {
      try {
        const qrToken = createQrToken({
          bookingId: booking._id,
          userId: req.userId,
          slotEnd: booking.slotEnd,
        });
        const qrPng = await createQrPngBuffer(qrToken);
        const pdfBuffer = await buildBookingPdf({ booking, user, qrPng });
        const from = process.env.MAIL_FROM || process.env.MAIL_USERNAME;

        await sendMail({
          from,
          to: user.email,
          subject: "Your JKS Arena Booking Confirmation",
          text: `Hi ${nameStr}, your booking is confirmed. Please find your QR entry pass attached.`,
          attachments: [{
            filename: `booking-${booking._id}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          }],
        });
      } catch (emailErr) {
        console.error("Email processing failed:", emailErr);
      }
    }

    return res.status(201).json({ booking });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;