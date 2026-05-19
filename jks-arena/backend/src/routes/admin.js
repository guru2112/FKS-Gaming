// backend/src/routes/admin.js
const express = require("express");
const jwt = require("jsonwebtoken"); 
const router = express.Router();

const User = require("../models/User");
const Booking = require("../models/Booking");
const Combo = require("../models/Combo");
const MediaItem = require("../models/MediaItem");

const {
  assertDeviceAvailable,
  computeSlotEnd,
  normalizeDevice,
} = require("../utils/sessionAvailability");

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

// ================== SESSIONS (UNIFIED) ==================
// GET /api/admin/sessions?date=YYYY-MM-DD
router.get("/sessions", async (req, res, next) => {
  try {
    const dateStr = req.query.date ? String(req.query.date) : null;

    const baseDate = dateStr ? new Date(`${dateStr}T00:00:00.000Z`) : new Date();

    const startOfDay = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), 23, 59, 59, 999));

    const sessions = await Booking.find({
      slotStart: { $lt: endOfDay },
      slotEnd: { $gte: startOfDay },
    })
      .select(
        "source sessionStatus walkInCustomer userName userContact contactNumber device slotStart slotEnd inTime outTime durationHours players game companions perHeadRate totalPrice paymentMethod amountPaid paymentStatus status actualStartTime createdAt"
      )
      .sort({ slotStart: 1 })
      .lean();

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/sessions/start (walk-in offline)
router.post("/sessions/start", async (req, res, next) => {
  try {
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
    } = req.body;

    if (!customerName || !phoneNumber || !device || !players || !outTime) {
      return res.status(400).json({ message: "Missing session fields." });
    }

    const normalizedDevice = normalizeDevice(device);
    const playersCount = Number(players);
    if (!Number.isFinite(playersCount) || playersCount < 1) {
      return res.status(400).json({ message: "Invalid players." });
    }

    const start = inTime ? new Date(inTime) : new Date();
    const end = new Date(outTime);
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid in time." });
    }
    if (Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid out time." });
    }

    const now = new Date();
    if (end.getTime() <= start.getTime()) {
      return res.status(400).json({ message: "Out time must be after in time." });
    }

    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = durationMs / 60000;
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return res.status(400).json({ message: "Invalid duration." });
    }
    const durationHours = durationMinutes / 60;

    try {
      await assertDeviceAvailable({
        device: normalizedDevice,
        slotStart: start,
        slotEnd: end,
      });
    } catch (err) {
      if (err && err.status === 409) {
        return res.status(409).json({ message: err.message });
      }
      throw err;
    }

    const DEVICE_RATES = {
      PS1: 60,
      PS2: 60,
      PS3: 60,
      SIM1: 100,
    };

    const perHeadRate = DEVICE_RATES[normalizedDevice];
    if (!perHeadRate) {
      return res.status(400).json({ message: "Invalid device selected." });
    }

    const rawTotal = playersCount * perHeadRate * durationHours;
    const totalPrice = Math.round(rawTotal);

    const companionsList = Array.isArray(companions) ? companions : [];
    if (playersCount > 1 && companionsList.length !== playersCount - 1) {
      return res.status(400).json({ message: "Player details mismatch." });
    }

    const paidAmount = amountPaid === undefined || amountPaid === null ? 0 : Number(amountPaid);
    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
      return res.status(400).json({ message: "Invalid amount paid." });
    }

    const method = paymentMethod ? String(paymentMethod).toLowerCase() : undefined;
    if (method && method !== "cash" && method !== "online") {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    const paymentStatus = paidAmount >= totalPrice ? "paid" : "partial";

    const isCompletedImmediately = end.getTime() <= now.getTime();
    const isScheduled = start.getTime() > now.getTime();
    const sessionStatus = isCompletedImmediately ? "completed" : isScheduled ? "scheduled" : "active";
    const legacyStatus = isCompletedImmediately ? "completed" : isScheduled ? "upcoming" : "active";
    const booking = await Booking.create({
      source: "offline",
      sessionStatus,
      walkInCustomer: true,

      // Keep compatibility with existing admin UI (status-driven)
      status: legacyStatus,
      actualStartTime: isScheduled ? undefined : start,

      userName: String(customerName).trim(),
      userContact: String(phoneNumber).trim(),
      contactNumber: String(phoneNumber).trim(),

      // Required fields for unified engine
      qrId: require("crypto").randomUUID(),
      device: normalizedDevice,
      slotStart: start,
      slotEnd: end,
      expiryTime: end,
      inTime: start,
      outTime: end,
      durationHours,
      game: game ? String(game).trim() : "",
      players: playersCount,
      perHeadRate,
      totalPrice,
      companions: companionsList,
      paymentMethod: method,
      amountPaid: paidAmount,
      paymentStatus,
    });

    res.status(201).json({ message: "Session started.", session: booking });
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

// Update payment method for a booking/session
router.patch("/bookings/:id/payment", async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const incoming = req.body ? req.body.paymentMethod : undefined;
    const normalized = incoming === null || incoming === "" || incoming === undefined ? undefined : String(incoming).toLowerCase();

    if (normalized && normalized !== "cash" && normalized !== "online") {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    booking.paymentMethod = normalized;

    // Keep paymentStatus in sync when possible
    const total = Number(booking.totalPrice || 0);
    const paid = Number(booking.amountPaid || 0);
    booking.paymentStatus = paid >= total ? "paid" : "partial";

    await booking.save();
    res.json({ message: "Payment method updated.", booking });
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
router.get("/media", async (req, res, next) => {
  try {
    const items = await MediaItem.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

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

    const buffer = Buffer.from(file.split(",")[1], "base64");

    const uploadRes = await uploadImageBuffer(buffer, {
      folder: `Photos/${category}`,
    });

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

// ================== SCAN QR CODE ==================
// ================== SCAN QR CODE ==================
// Replace the POST /scan route:
router.post("/scan", async (req, res, next) => {
  try {
    const { token } = req.body; // token is now the qrId scanned from the URL
    if (!token) return res.status(400).json({ message: "No data scanned." });

    const booking = await Booking.findOne({ qrId: token }).populate("userId", "name email");
    
    if (!booking) {
      return res.status(404).json({ message: "Invalid Pass: Booking not found." });
    }

    const now = new Date();
    if (now < new Date(booking.slotStart)) {
      return res.status(400).json({ message: "Session not active yet. Check in at start time." });
    }

    if (now > new Date(booking.expiryTime)) {
      booking.status = "completed";
      booking.sessionStatus = "completed";
      await booking.save();
      return res.status(400).json({ message: "Pass Expired: Time slot has passed." });
    }

    if (booking.status === "active") {
      return res.status(400).json({ message: "Session already in progress." });
    }

    booking.status = "active";
    booking.sessionStatus = "active";
    booking.actualStartTime = now; 
    await booking.save();

    res.json({ message: "Success! Rig activated.", booking });
  } catch (err) {
    next(err);
  }
});


// ================== GET LIVE RIGS ==================
router.get("/live", async (req, res, next) => {
  try {
    // Fetch only bookings that are currently playing
    const liveBookings = await Booking.find({ status: "active" })
      .select("userName device slotStart slotEnd durationHours players")
      .lean();
    res.json({ liveBookings });
  } catch (err) {
    next(err);
  }
});

// ================== END SESSION MANUALLY ==================
router.post("/end-session/:id", async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.status !== "active") return res.status(400).json({ message: "Only active sessions can be ended." });
    
    // Mark as completed so the rig becomes "Available" again
    const out = req.body && req.body.outTime ? new Date(req.body.outTime) : new Date();
    if (Number.isNaN(out.getTime())) {
      return res.status(400).json({ message: "Invalid out time." });
    }

    const amountPaidRaw = req.body && req.body.amountPaid !== undefined ? Number(req.body.amountPaid) : null;
    if (amountPaidRaw !== null) {
      if (!Number.isFinite(amountPaidRaw) || amountPaidRaw < 0) {
        return res.status(400).json({ message: "Invalid amount paid." });
      }
      booking.amountPaid = amountPaidRaw;
    }

    if (req.body && req.body.paymentMethod) {
      const method = String(req.body.paymentMethod).toLowerCase();
      if (method !== "cash" && method !== "online") {
        return res.status(400).json({ message: "Invalid payment method." });
      }
      booking.paymentMethod = method;
    }

    booking.status = "completed";
    booking.sessionStatus = "completed";
    // Ensure early-ended sessions don't keep blocking availability
    booking.slotEnd = out;
    booking.expiryTime = out;
    booking.outTime = out;
    if (!booking.inTime) {
      booking.inTime = booking.slotStart;
    }

    // For offline sessions, recompute billed duration and total based on actual play time
    if ((booking.source || "online") === "offline") {
      const inT = new Date(booking.inTime);
      const minutes = Math.max(0, (out.getTime() - inT.getTime()) / 60000);
      const hours = minutes / 60;
      booking.durationHours = hours;
      const rawTotal = Number(booking.players || 1) * Number(booking.perHeadRate || 0) * hours;
      booking.totalPrice = Math.round(rawTotal);
    }

    const paid = Number(booking.amountPaid || 0);
    booking.paymentStatus = paid >= Number(booking.totalPrice || 0) ? "paid" : "partial";
    await booking.save();
    
    res.json({ message: "Session completed successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;