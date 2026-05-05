const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Combo = require("../models/Combo");
const MediaItem = require("../models/MediaItem");
const { requireAdmin } = require("../middleware/auth");
const { imageUpload, uploadImageBuffer, deleteImage } = require("../utils/cloudinary");

const router = express.Router();

const DEVICE_RATES = {
  PS1: 60,
  PS2: 60,
  PS3: 60,
  SIM1: 100,
};

function normalizeCategory(value) {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  if (key === "games" || key === "game") return "Games";
  if (key === "food" || key === "foods") return "Food";
  if (key === "drinks" || key === "drink") return "Drinks";
  return null;
}

function cleanText(value) {
  return value ? String(value).trim() : "";
}

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
    const {
      userId,
      game,
      slotStart,
      durationHours,
      device,
      players,
      status,
      contactNumber,
      companions,
    } = req.body;

    if (!userId || !slotStart || !durationHours || !device || !players || !contactNumber) {
      return res.status(400).json({ message: "Missing booking fields." });
    }

    const contact = String(contactNumber).trim();
    if (!contact) {
      return res.status(400).json({ message: "Contact number is required." });
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

    const companionsList = Array.isArray(companions) ? companions : [];
    const expectedCompanions = Math.max(playersCount - 1, 0);

    if (companionsList.length !== expectedCompanions) {
      return res
        .status(400)
        .json({ message: "Companion details must match total players." });
    }

    const normalizedCompanions = [];
    for (const companion of companionsList) {
      const name = String(companion?.name || "").trim();
      const phone = String(companion?.phone || "").trim();
      if (!name || !phone) {
        return res
          .status(400)
          .json({ message: "Companion name and phone are required." });
      }
      normalizedCompanions.push({ name, phone });
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
      contactNumber: contact,
      companions: normalizedCompanions,
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

router.get("/media", async (req, res, next) => {
  try {
    const items = await MediaItem.find().sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

router.post("/media", imageUpload.single("image"), async (req, res, next) => {
  try {
    const category = normalizeCategory(req.body.category);
    if (!category) {
      return res.status(400).json({ message: "Invalid category." });
    }

    const title = cleanText(req.body.title);
    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const description = cleanText(req.body.description);
    const price = cleanText(req.body.price);
    const flavor = cleanText(req.body.flavor);
    const packSize = cleanText(req.body.packSize);
    const itemType = cleanText(req.body.itemType);

    if ((category === "Food" || category === "Drinks") && !price) {
      return res.status(400).json({ message: "Price is required for food and drinks." });
    }

    const folder = `Photos/${category}`;
    const uploadResult = await uploadImageBuffer(req.file.buffer, { folder });

    const item = await MediaItem.create({
      title,
      description,
      category,
      price,
      flavor,
      packSize,
      itemType,
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      folder,
    });

    return res.status(201).json({ item });
  } catch (err) {
    return next(err);
  }
});

router.patch("/media/:id", imageUpload.single("image"), async (req, res, next) => {
  try {
    const item = await MediaItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Media item not found." });
    }

    const update = {};
    let nextCategory = item.category;

    if (req.body.category !== undefined) {
      const normalizedCategory = normalizeCategory(req.body.category);
      if (!normalizedCategory) {
        return res.status(400).json({ message: "Invalid category." });
      }
      nextCategory = normalizedCategory;
      update.category = normalizedCategory;
    }

    if (req.body.title !== undefined) {
      const title = cleanText(req.body.title);
      if (!title) {
        return res.status(400).json({ message: "Title is required." });
      }
      update.title = title;
    }

    if (req.body.description !== undefined) {
      update.description = cleanText(req.body.description);
    }

    if (req.body.price !== undefined) {
      update.price = cleanText(req.body.price);
    }

    if (req.body.flavor !== undefined) {
      update.flavor = cleanText(req.body.flavor);
    }

    if (req.body.packSize !== undefined) {
      update.packSize = cleanText(req.body.packSize);
    }

    if (req.body.itemType !== undefined) {
      update.itemType = cleanText(req.body.itemType);
    }

    const priceValue =
      update.price !== undefined ? update.price : cleanText(item.price);
    if ((nextCategory === "Food" || nextCategory === "Drinks") && !priceValue) {
      return res.status(400).json({ message: "Price is required for food and drinks." });
    }

    let newPublicId = null;
    if (req.file) {
      const folder = `Photos/${nextCategory}`;
      const uploadResult = await uploadImageBuffer(req.file.buffer, { folder });
      update.imageUrl = uploadResult.secure_url;
      update.publicId = uploadResult.public_id;
      update.folder = folder;
      newPublicId = uploadResult.public_id;
    }

    const updated = await MediaItem.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Media item not found." });
    }

    if (req.file && newPublicId) {
      await deleteImage(item.publicId);
    }

    return res.json({ item: updated });
  } catch (err) {
    return next(err);
  }
});

router.delete("/media/:id", async (req, res, next) => {
  try {
    const item = await MediaItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Media item not found." });
    }

    await deleteImage(item.publicId);
    await item.deleteOne();

    return res.json({ message: "Media item deleted." });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
