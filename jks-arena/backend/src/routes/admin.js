const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Combo = require("../models/Combo");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

const DEVICE_RATES = {
  PS1: 60,
  PS2: 60,
  PS3: 60,
  SIM1: 100,
};

router.use(requireAdmin);

router.get("/overview", async (req, res, next) => {
  try {
    const [userCount, bookingCount, comboCount] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Combo.countDocuments(),
    ]);

    res.json({
      users: userCount,
      bookings: bookingCount,
      combos: comboCount,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find()
      .select("name email planId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name email planId createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.patch("/users/:id", async (req, res, next) => {
  try {
    const { name, email, planId } = req.body;
    const update = {};

    if (name) {
      update.name = name.trim();
    }
    if (email) {
      update.email = email.toLowerCase().trim();
    }
    if (planId !== undefined) {
      update.planId = planId || null;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("name email planId");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({ message: "User deleted." });
  } catch (err) {
    return next(err);
  }
});

router.get("/bookings", async (req, res, next) => {
  try {
    const now = new Date();
    await Booking.updateMany(
      {
        status: "upcoming",
        slotEnd: { $exists: true, $lt: now },
      },
      { $set: { status: "completed" } }
    );

    const bookings = await Booking.find()
      .populate("userId", "name email")
      .sort({ slotStart: -1 })
      .lean();

    return res.json({ bookings });
  } catch (err) {
    return next(err);
  }
});

router.post("/bookings", async (req, res, next) => {
  try {
    const { userId, game, slotStart, durationHours, device, players, status } = req.body;

    if (!userId || !slotStart || !durationHours || !device || !players) {
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
    const totalPrice = playersCount * perHeadRate * duration;

    const booking = await Booking.create({
      userId,
      game: game ? String(game).trim() : "",
      device: normalizedDevice,
      slotStart: start,
      slotEnd,
      durationHours: duration,
      players: playersCount,
      perHeadRate,
      totalPrice,
      rig: normalizedDevice,
      status,
    });

    return res.status(201).json({ booking });
  } catch (err) {
    return next(err);
  }
});

router.patch("/bookings/:id", async (req, res, next) => {
  try {
    const { game, slotStart, durationHours, device, players, status } = req.body;
    const update = {};

    if (device) {
      const normalizedDevice = String(device).toUpperCase();
      const rate = DEVICE_RATES[normalizedDevice];
      if (!rate) {
        return res.status(400).json({ message: "Invalid device selected." });
      }
      update.device = normalizedDevice;
      update.perHeadRate = rate;
      update.rig = normalizedDevice;
    }

    if (game) {
      update.game = game.trim();
    }
    if (slotStart) {
      update.slotStart = new Date(slotStart);
      if (Number.isNaN(update.slotStart.getTime())) {
        return res.status(400).json({ message: "Invalid slotStart time." });
      }
    }
    if (durationHours) {
      const duration = Number(durationHours);
      if (Number.isNaN(duration) || duration <= 0) {
        return res.status(400).json({ message: "Duration must be greater than 0." });
      }
      update.durationHours = duration;
    }
    if (players !== undefined) {
      const playersCount = Number(players);
      if (Number.isNaN(playersCount) || playersCount < 1 || playersCount > 5) {
        return res.status(400).json({ message: "Players must be between 1 and 5." });
      }
      update.players = playersCount;
    }
    if (status) {
      update.status = status;
    }

    let bookingForUpdate = null;
    if (update.slotStart || update.durationHours || update.perHeadRate || update.players) {
      bookingForUpdate = await Booking.findById(req.params.id).lean();
      if (!bookingForUpdate) {
        return res.status(404).json({ message: "Booking not found." });
      }
    }

    if (bookingForUpdate && (update.slotStart || update.durationHours)) {
      const baseStart = update.slotStart ?? bookingForUpdate.slotStart;
      const baseDuration = update.durationHours ?? bookingForUpdate.durationHours;
      update.slotEnd = new Date(baseStart.getTime() + baseDuration * 60 * 60 * 1000);
    }

    if (bookingForUpdate && (update.perHeadRate || update.players || update.durationHours)) {
      const perHeadRate = update.perHeadRate ?? bookingForUpdate.perHeadRate;
      const playersCount = update.players ?? bookingForUpdate.players;
      const duration = update.durationHours ?? bookingForUpdate.durationHours;
      update.totalPrice = perHeadRate * playersCount * duration;
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
});

router.delete("/bookings/:id", async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    return res.json({ message: "Booking deleted." });
  } catch (err) {
    return next(err);
  }
});

router.get("/combos", async (req, res, next) => {
  try {
    const combos = await Combo.find().sort({ createdAt: -1 }).lean();
    return res.json({ combos });
  } catch (err) {
    return next(err);
  }
});

router.post("/combos", async (req, res, next) => {
  try {
    const { name, items, price, durationHours, description, isActive } = req.body;

    if (!name || price === undefined || !durationHours) {
      return res.status(400).json({ message: "Missing combo fields." });
    }

    const combo = await Combo.create({
      name: name.trim(),
      items: Array.isArray(items) ? items : [],
      price,
      durationHours,
      description: description ? description.trim() : "",
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ combo });
  } catch (err) {
    return next(err);
  }
});

router.patch("/combos/:id", async (req, res, next) => {
  try {
    const { name, items, price, durationHours, description, isActive } = req.body;
    const update = {};

    if (name) {
      update.name = name.trim();
    }
    if (items) {
      update.items = Array.isArray(items) ? items : [];
    }
    if (price !== undefined) {
      update.price = price;
    }
    if (durationHours) {
      update.durationHours = durationHours;
    }
    if (description !== undefined) {
      update.description = description ? description.trim() : "";
    }
    if (isActive !== undefined) {
      update.isActive = isActive;
    }

    const combo = await Combo.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!combo) {
      return res.status(404).json({ message: "Combo not found." });
    }

    return res.json({ combo });
  } catch (err) {
    return next(err);
  }
});

router.delete("/combos/:id", async (req, res, next) => {
  try {
    const combo = await Combo.findByIdAndDelete(req.params.id);
    if (!combo) {
      return res.status(404).json({ message: "Combo not found." });
    }
    return res.json({ message: "Combo deleted." });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
