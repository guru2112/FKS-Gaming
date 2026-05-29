const Booking = require("../../models/Booking");
const { assertDeviceAvailable, normalizeDevice } = require("../../utils/sessionAvailability");
const { sendMail } = require("../../utils/mailer");
const crypto = require("crypto");
const { DEVICE_RATES } = require("../../config/constants");

exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
};

exports.getSessions = async (req, res, next) => {
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
};

exports.startOfflineSession = async (req, res, next) => {
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

    const perHeadRate = DEVICE_RATES[normalizedDevice];
    if (!perHeadRate) {
      return res.status(400).json({ message: "Invalid device selected." });
    }

    const rawTotal = playersCount * perHeadRate * durationHours;
    const totalPrice = Math.round(rawTotal);

    const companionsList = (Array.isArray(companions) ? companions : []).filter(c => c && c.name && c.phone);

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
      status: legacyStatus,
      actualStartTime: isScheduled ? undefined : start,
      userName: String(customerName).trim(),
      userContact: String(phoneNumber).trim(),
      contactNumber: String(phoneNumber).trim(),
      qrId: crypto.randomUUID(),
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
};

exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const incoming = req.body ? req.body.paymentMethod : undefined;
    const normalized = incoming === null || incoming === "" || incoming === undefined ? undefined : String(incoming).toLowerCase();

    if (normalized && normalized !== "cash" && normalized !== "online") {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    booking.paymentMethod = normalized;

    const total = Number(booking.totalPrice || 0);
    const paid = Number(booking.amountPaid || 0);
    booking.paymentStatus = paid >= total ? "paid" : "partial";

    await booking.save();
    res.json({ message: "Payment method updated.", booking });
  } catch (err) {
    next(err);
  }
};

exports.addPartialPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const { amount, method } = req.body;
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Valid amount is required." });
    }

    const normalized = method ? String(method).toLowerCase() : booking.paymentMethod;
    if (normalized && normalized !== "cash" && normalized !== "online") {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    if (!booking.payments) booking.payments = [];
    booking.payments.push({ method: normalized || "cash", amount: amountNum });

    booking.amountPaid = (booking.amountPaid || 0) + amountNum;
    booking.paymentMethod = normalized;

    const total = Number(booking.totalPrice || 0);
    booking.paymentStatus = booking.amountPaid >= total ? "paid" : "partial";

    await booking.save();
    res.json({ message: "Payment added successfully.", booking });
  } catch (err) {
    next(err);
  }
};

exports.scanQr = async (req, res, next) => {
  try {
    const { token } = req.body;
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
};

exports.getLiveBookings = async (req, res, next) => {
  try {
    const liveBookings = await Booking.find({ status: "active" })
      .select("userName device slotStart slotEnd durationHours players")
      .lean();
    res.json({ liveBookings });
  } catch (err) {
    next(err);
  }
};

exports.endSession = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.status !== "active") return res.status(400).json({ message: "Only active sessions can be ended." });
    
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
    booking.slotEnd = out;
    booking.expiryTime = out;
    booking.outTime = out;
    if (!booking.inTime) {
      booking.inTime = booking.slotStart;
    }

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
};

exports.checkAvailability = async (req, res, next) => {
  try {
    const { slotStart, durationHours, excludeBookingId } = req.query;
    if (!slotStart || !durationHours) return res.status(400).json({ message: "Missing slotStart or durationHours" });

    const start = new Date(slotStart);
    const end = new Date(start.getTime() + Number(durationHours) * 60 * 60 * 1000);
    const devices = ["PS1", "PS2", "PS3", "SIM1"];
    const status = {};

    for (const d of devices) {
      try {
        await assertDeviceAvailable({
          device: d,
          slotStart: start,
          slotEnd: end,
          excludeBookingId: excludeBookingId || undefined,
        });
        status[d] = "available";
      } catch (e) {
        status[d] = "busy";
      }
    }
    
    res.json({ devices: status });
  } catch (err) {
    next(err);
  }
};

exports.rescheduleBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.status !== "upcoming" && booking.status !== "active") {
      return res.status(400).json({ message: "Can only reschedule upcoming or active bookings." });
    }

    const { slotStart, durationHours, device } = req.body;
    if (!slotStart || !durationHours || !device) return res.status(400).json({ message: "Missing required fields." });

    const newStart = new Date(slotStart);
    const newEnd = new Date(newStart.getTime() + Number(durationHours) * 60 * 60 * 1000);

    try {
      await assertDeviceAvailable({
        device,
        slotStart: newStart,
        slotEnd: newEnd,
        excludeBookingId: booking._id,
      });
    } catch (err) {
      if (err && err.status === 409) return res.status(409).json({ message: err.message });
      throw err;
    }

    booking.slotStart = newStart;
    booking.slotEnd = newEnd;
    booking.expiryTime = newEnd;
    booking.durationHours = Number(durationHours);
    booking.device = device;
    
    if (booking.perHeadRate) {
      const newRate = DEVICE_RATES[device] || 50;
      booking.perHeadRate = newRate;
      const rawTotal = Number(booking.players || 1) * newRate * booking.durationHours;
      booking.totalPrice = Math.round(rawTotal);
      
      const paid = Number(booking.amountPaid || 0);
      booking.paymentStatus = paid >= booking.totalPrice ? "paid" : "partial";
    }

    await booking.save();

    if (booking.source === "online" && booking.userContact && booking.userContact.includes("@")) {
      const formattedDate = newStart.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' });
      const formattedTime = newStart.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });
      
      await sendMail({
        to: booking.userContact,
        subject: `Reschedule Confirmed - JKS Arena`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #eee;">
            <div style="background-color: #1A1A1A; padding: 30px; text-align: center;">
              <h1 style="color: #ff6b35; margin: 0; font-size: 28px; text-transform: uppercase;">JKS ARENA</h1>
              <p style="color: #fff; margin: 10px 0 0; opacity: 0.8; letter-spacing: 2px; text-transform: uppercase; font-size: 12px;">Booking Rescheduled</p>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin-top: 0;">Hi ${booking.userName},</p>
              <p style="font-size: 16px; color: #666; line-height: 1.6;">Your gaming session has been successfully rescheduled. Here are your updated booking details:</p>
              
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                  <span style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">New Date & Time</span>
                  <span style="color: #0f172a; font-weight: bold;">${formattedDate} at ${formattedTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                  <span style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Console</span>
                  <span style="color: #ff6b35; font-weight: bold;">${booking.device}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Duration</span>
                  <span style="color: #0f172a; font-weight: bold;">${formatDuration(booking.durationHours)}</span>
                </div>
              </div>
              <p style="color: #666; font-size: 14px; text-align: center;">Your original QR Pass will still work for this new time.</p>
            </div>
          </div>
        `
      }).catch(e => console.error("Failed to send reschedule email:", e));
    }

    res.json({ message: "Booking rescheduled successfully.", booking });
  } catch (err) {
    next(err);
  }
};

exports.extendSession = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    
    if (booking.status !== "active") {
      return res.status(400).json({ message: "Only active sessions can be extended." });
    }

    const extraMinutes = Number(req.body.extraMinutes);
    if (!Number.isFinite(extraMinutes) || extraMinutes <= 0) {
      return res.status(400).json({ message: "Invalid extra minutes." });
    }

    const newSlotEnd = new Date(booking.slotEnd.getTime() + extraMinutes * 60000);

    try {
      await assertDeviceAvailable({
        device: booking.device,
        slotStart: booking.slotStart,
        slotEnd: newSlotEnd,
        excludeBookingId: booking._id,
      });
    } catch (err) {
      if (err && err.status === 409) {
        return res.status(409).json({ message: err.message });
      }
      throw err;
    }

    booking.slotEnd = newSlotEnd;
    booking.outTime = newSlotEnd;
    booking.expiryTime = newSlotEnd;
    booking.durationHours += (extraMinutes / 60);

    if (booking.perHeadRate) {
      const addedCost = Number(booking.players || 1) * Number(booking.perHeadRate) * (extraMinutes / 60);
      booking.totalPrice = Math.round(Number(booking.totalPrice || 0) + addedCost);
      
      const paid = Number(booking.amountPaid || 0);
      booking.paymentStatus = paid >= booking.totalPrice ? "paid" : "partial";
    }

    await booking.save();
    
    res.json({ message: "Session extended successfully.", booking });
  } catch (err) {
    next(err);
  }
};
