const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Booking = require("../models/Booking");
const Combo = require("../models/Combo");
const MediaItem = require("../models/MediaItem");

const { requireAdmin } = require("../middleware/auth");
const { uploadImageBuffer, deleteImage } = require("../utils/cloudinary");

// ================== MIDDLEWARE ==================
router.use(requireAdmin);

// ================== OVERVIEW ==================
router.get("/overview", async (req, res, next) => {
  try {
    const [users, bookings, combos] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Combo.countDocuments(),
    ]);

    res.json({ users, bookings, combos });
  } catch (err) {
    next(err);
  }
});

// ================== USERS ==================
router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

// ================== BOOKINGS ==================
router.get("/bookings", async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

router.delete("/bookings/:id", async (req, res, next) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
});

// ================== COMBOS ==================
router.get("/combos", async (req, res, next) => {
  try {
    const combos = await Combo.find().sort({ createdAt: -1 });
    res.json({ combos });
  } catch (err) {
    next(err);
  }
});

router.post("/combos", async (req, res, next) => {
  try {
    const combo = await Combo.create(req.body);
    res.status(201).json({ combo });
  } catch (err) {
    next(err);
  }
});

router.delete("/combos/:id", async (req, res, next) => {
  try {
    await Combo.findByIdAndDelete(req.params.id);
    res.json({ message: "Combo deleted" });
  } catch (err) {
    next(err);
  }
});

// ================== MEDIA ==================

// 🔥 GET MEDIA
router.get("/media", async (req, res, next) => {
  try {
    const items = await MediaItem.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// 🔥 UPLOAD MEDIA (BASE64)
router.post("/media", async (req, res, next) => {
  try {
    console.log("🔥 Admin upload request");

    const { name, category, gameName, file } = req.body;

    if (!file || !name || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!file.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    // Convert base64 → buffer
    const buffer = Buffer.from(file.split(",")[1], "base64");

    // Upload to Cloudinary
    const uploadRes = await uploadImageBuffer(buffer, {
      folder: `Photos/${category}`,
    });

    // Save in MongoDB
    const item = await MediaItem.create({
      name,
      category,
      gameName,
      secure_url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    });

    console.log("✅ Saved:", item._id);

    res.status(201).json({ item });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// 🔥 UPDATE MEDIA
router.patch("/media/:id", async (req, res, next) => {
  try {
    const item = await MediaItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Media item not found" });
    }

    const update = {};

    if (req.body.name) update.name = req.body.name;
    if (req.body.category) update.category = req.body.category;
    if (req.body.gameName) update.gameName = req.body.gameName;

    if (req.body.file) {
      if (!req.body.file.startsWith("data:image")) {
        return res.status(400).json({ message: "Invalid image format" });
      }

      const buffer = Buffer.from(req.body.file.split(",")[1], "base64");

      const uploadRes = await uploadImageBuffer(buffer, {
        folder: `Photos/${req.body.category || item.category}`,
      });

      update.secure_url = uploadRes.secure_url;
      update.public_id = uploadRes.public_id;

      // delete old image
      await deleteImage(item.public_id);
    }

    const updated = await MediaItem.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
});

// 🔥 DELETE MEDIA
router.delete("/media/:id", async (req, res, next) => {
  try {
    const item = await MediaItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Media item not found" });
    }

    await deleteImage(item.public_id);
    await item.deleteOne();

    res.json({ message: "Media item deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;