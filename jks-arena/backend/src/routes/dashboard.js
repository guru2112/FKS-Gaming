const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Plan = require("../models/Plan");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const DEVICE_RATES = {
  PS1: 60,
  PS2: 60,
  PS3: 60,
  SIM1: 100,
};

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

async function ensureDefaultPlans() {
  const count = await Plan.countDocuments();
  if (count === 0) {
    await Plan.insertMany(defaultPlans);
  }
}

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("name email planId");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let plan = null;
    if (user.planId) {
      plan = await Plan.findById(user.planId).select("name priceMonthly perks");
    }

    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currentPlan: plan,
    });
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
    const { device, slotStart, durationHours, players, game } = req.body;

    if (!device || !slotStart || !durationHours || !players) {
      return res.status(400).json({ message: "Missing booking fields." });
    }

    const normalizedDevice = String(device).toUpperCase();
    const perHeadRate = DEVICE_RATES[normalizedDevice];

    if (!perHeadRate) {
      return res.status(400).json({ message: "Invalid device selected." });
    }

    const playersCount = Number(players);
    if (Number.isNaN(playersCount) || playersCount < 1 || playersCount > 5) {
      return res.status(400).json({ message: "Players must be between 1 and 5." });
    }

    const duration = Number(durationHours);
    if (Number.isNaN(duration) || duration <= 0) {
      return res.status(400).json({ message: "Duration must be greater than 0." });
    }

    const start = new Date(slotStart);
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid slotStart time." });
    }

    const slotEnd = new Date(start.getTime() + duration * 60 * 60 * 1000);

    const conflict = await Booking.findOne({
      device: normalizedDevice,
      status: { $ne: "cancelled" },
      slotStart: { $lt: slotEnd },
      slotEnd: { $gt: start },
    }).lean();

    if (conflict) {
      return res.status(409).json({ message: "Selected slot is not available." });
    }

    const totalPrice = playersCount * perHeadRate * duration;

    const booking = await Booking.create({
      userId: req.userId,
      game: game ? String(game).trim() : "",
      device: normalizedDevice,
      slotStart: start,
      slotEnd,
      durationHours: duration,
      players: playersCount,
      perHeadRate,
      totalPrice,
      rig: normalizedDevice,
    });

    return res.status(201).json({ booking });
  } catch (err) {
    return next(err);
  }
});

router.get("/plans", authenticate, async (req, res, next) => {
  try {
    await ensureDefaultPlans();
    const plans = await Plan.find({ isActive: true }).sort({ priceMonthly: 1 }).lean();

    return res.json({ plans });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
