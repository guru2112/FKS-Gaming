// backend/src/routes/dashboard.js

const express = require("express");

const User = require("../models/User");
const Booking = require("../models/Booking");
const Plan = require("../models/Plan");

// 🔥 NEW
const Notification = require("../models/Notification");

const {
  sendPushToUser,
} = require("../utils/pushNotifications");

const { authenticate } = require("../middleware/auth");

const {
  assertDeviceAvailable,
  normalizeDevice,
} = require("../utils/sessionAvailability");

const { sendMail } = require("../utils/mailer");

const {
  createQrPngBuffer,
} = require("../utils/qrCode");

const {
  buildBookingPdf,
} = require("../utils/bookingPdf");

const crypto = require("crypto");

const router = express.Router();

const { DEVICE_RATES } = require("../config/constants");

// =========================================================
// 🔥 DEFAULT PLANS
// =========================================================

const defaultPlans = [
  {
    name: "Free",
    priceMonthly: 0,
    perks: [
      "Standard rigs",
      "Cafe access",
    ],
  },

  {
    name: "Pro",
    priceMonthly: 1499,
    perks: [
      "Priority rigs",
      "Tournament entries",
      "10% cafe discount",
    ],
  },

  {
    name: "VIP",
    priceMonthly: 2999,
    perks: [
      "Private room hours",
      "Dedicated support",
      "20% cafe discount",
    ],
  },
];

// =========================================================
// 🔥 ENSURE DEFAULT PLANS
// =========================================================

async function ensureDefaultPlans() {

  const count =
    await Plan.countDocuments();

  if (count === 0) {

    await Plan.insertMany(
      defaultPlans
    );

  }

}

// =========================================================
// 🔥 GET CURRENT USER
// =========================================================

router.get(
  "/me",
  authenticate,
  async (req, res, next) => {

    try {

      const user =
        await User.findById(
          req.userId
        ).select(
          "name email"
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found.",
        });

      }

      let plan = null;

      return res.json({
        id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        currentPlan:
          plan,
      });

    } catch (err) {

      return next(err);

    }

  }
);

// =========================================================
// 🔥 GET USER BOOKINGS
// =========================================================

router.get(
  "/bookings",
  authenticate,
  async (req, res, next) => {

    try {

      const now =
        new Date();

      // =====================================================
      // AUTO COMPLETE OLD BOOKINGS
      // =====================================================

      Booking.updateMany(
        {
          userId: req.userId,
          status: "upcoming",
          slotEnd: { $exists: true, $lt: now },
        },
        {
          $set: {
            status: "completed",
            sessionStatus: "completed",
          },
        }
      ).catch(err => console.error("Auto complete bookings error:", err));

      const bookings =
        await Booking.find({
          userId:
            req.userId,
        })
          .sort({
            slotStart: -1,
          })
          .lean();

      return res.json({
        bookings,
      });

    } catch (err) {

      return next(err);

    }

  }
);

// =========================================================
// 🔥 GET BOOKING AVAILABILITY CHECK
// =========================================================

router.get(
  "/bookings/availability-check",
  authenticate,
  async (req, res, next) => {
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
  }
);

// =========================================================
// 🔥 GET BOOKING SCHEDULE
// =========================================================

router.get(
  "/bookings/schedule",
  authenticate,
  async (req, res, next) => {

    try {

      const {
        date,
        device,
      } = req.query;

      if (!date) {

        return res.status(400).json({
          message:
            "Date is required.",
        });

      }

      const queryDate =
        new Date(date);

      const startOfDay =
        new Date(
          queryDate.setHours(
            0,
            0,
            0,
            0
          )
        );

      const endOfDay =
        new Date(
          queryDate.setHours(
            23,
            59,
            59,
            999
          )
        );

      // =====================================================
      // BASE QUERY
      // =====================================================

      const query = {
        status: {
          $ne:
            "cancelled",
        },

        slotStart: {
          $gte:
            startOfDay,

          $lte:
            endOfDay,
        },
      };

      // =====================================================
      // FILTER DEVICE
      // =====================================================

      if (
        device &&
        device !== "ALL"
      ) {

        query.device =
          String(device)
            .toUpperCase();

      }

      const bookings =
        await Booking.find(query)
          .select(
            "device slotStart slotEnd"
          )
          .sort({
            device: 1,
            slotStart: 1,
          })
          .lean();

      return res.json({
        bookings,
      });

    } catch (err) {

      return next(err);

    }

  }
);

// =========================================================
// 🔥 CREATE BOOKING
// =========================================================

router.post(
  "/bookings",
  authenticate,
  async (req, res, next) => {

    try {

      const {
        device,
        slotStart,
        durationHours,
        players,
        game,
        contactNumber,
        companions,
        userName,
      } = req.body;

      // =====================================================
      // VALIDATION
      // =====================================================

      if (
        !device ||
        !slotStart ||
        !durationHours ||
        !players ||
        !contactNumber
      ) {

        return res.status(400).json({
          message:
            "Missing booking fields.",
        });

      }

      const contact =
        String(
          contactNumber
        ).trim();

      const normalizedDevice =
        normalizeDevice(device);

      const perHeadRate =
        DEVICE_RATES[
          normalizedDevice
        ];

      if (!perHeadRate) {

        return res.status(400).json({
          message:
            "Invalid device selected.",
        });

      }

      const playersCount =
        Number(players);

      const duration =
        Number(durationHours);

      const start =
        new Date(slotStart);

      const slotEnd =
        new Date(
          start.getTime() +
          duration *
            60 *
            60 *
            1000
        );

      // =====================================================
      // QR + EXPIRY
      // =====================================================

      const qrId =
        crypto.randomUUID();

      const expiryTime =
        slotEnd;

      // =====================================================
      // CHECK SLOT CONFLICT (Shared Engine)
      // =====================================================

      try {
        await assertDeviceAvailable({
          device: normalizedDevice,
          slotStart: start,
          slotEnd,
        });
      } catch (err) {
        if (err && err.status === 409) {
          return res.status(409).json({ message: err.message });
        }
        throw err;
      }

      // =====================================================
      // TOTAL PRICE
      // =====================================================

      const totalPrice =
        playersCount *
        perHeadRate *
        duration;

      // =====================================================
      // CREATE BOOKING
      // =====================================================

      const booking =
        await Booking.create({
          source: "online",
          sessionStatus: "scheduled",
          walkInCustomer: false,

          userId:
            req.userId,

          userName:
            userName
              ? String(
                  userName
                ).trim()
              : "Player",

          userContact:
            contact,

          qrId,

          expiryTime,

          game:
            game
              ? String(
                  game
                ).trim()
              : "",

          device:
            normalizedDevice,

          slotStart:
            start,

          slotEnd,

          inTime:
            start,

          outTime:
            slotEnd,

          durationHours:
            duration,

          players:
            playersCount,

          contactNumber:
            contact,

          companions:
            (companions || []).filter(c => c && c.name && c.phone),

          perHeadRate,

          totalPrice,

          rig:
            normalizedDevice,
        });

      // =====================================================
      // 🔥 CREATE NOTIFICATION
      // =====================================================

      const notification =
        await Notification.create({
        userId:
          req.userId,

        title:
          "🎮 Booking Confirmed!",

        message:
          `Your ${booking.durationHours} hour session on ${booking.device} is confirmed! Get ready to play.`,

        type:
          "booking",

        link:
          "/dashboard",
      });



      // =====================================================
      // GET USER
      // =====================================================

      const user =
        await User.findById(
          req.userId
        )
          .select(
            "name email notifications"
          )
          .lean();

      // =====================================================
      // SEND PUSH (respect user setting)
      // =====================================================

      if (user?.notifications?.bookingUpdates !== false) {
        // Best-effort push (do not block booking flow)
        await sendPushToUser(req.userId, {
          title: notification.title,
          body: notification.message,
          data: {
            type: notification.type,
            link: notification.link,
            notificationId: notification._id,
          },
        });
      }

      // =====================================================
      // SEND EMAIL (fire-and-forget — does not block response)
      // =====================================================

      const emailUser = user; // capture for closure

      if (
        emailUser?.email &&
        emailUser?.notifications
          ?.bookingUpdates !== false
      ) {

        // Run in background — booking response returns immediately
        (async () => {
          try {

            const frontendUrl =
              process.env.FRONTEND_URL ||
              process.env.CLIENT_ORIGIN ||
              "https://fks-gaming.vercel.app";

            const qrViewUrl =
              `${frontendUrl}/qr/${qrId}`;

            const qrPng =
              await createQrPngBuffer(
                qrViewUrl
              );

            const pdfBuffer =
              await buildBookingPdf({
                booking,
                user: emailUser,
                qrPng,
              });

            const from =
              process.env.MAIL_FROM ||
              process.env.MAIL_USERNAME;

            await sendMail({
              from,

              to:
                emailUser.email,

              subject:
                "Your JKS Arena Access Pass",

              html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                  
                  <!-- Header -->
                  <div style="background: linear-gradient(135deg, #ff4500 0%, #ff8c00 100%); padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px; text-transform: uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">JKS ARENA</h1>
                    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">PREMIUM GAMING LOUNGE</p>
                  </div>

                  <!-- Body -->
                  <div style="padding: 40px 30px;">
                    <h2 style="margin-top: 0; color: #ffffff; font-size: 22px;">Booking Confirmed! 🎮</h2>
                    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
                      Hi <strong style="color: #ffffff;">${emailUser.name}</strong>,<br>
                      Your gaming session has been successfully booked. Get ready for an epic experience!
                    </p>

                    <!-- Details Card -->
                    <div style="margin-top: 30px; background-color: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 25px;">
                      <h3 style="margin-top: 0; color: #ff4500; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 10px;">Session Details</h3>
                      
                      <table style="width: 100%; color: #e0e0e0; font-size: 15px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a;"><strong>Rig / Device</strong></td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a; text-align: right; color: #ffffff;">${booking.device}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a;"><strong>Game</strong></td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a; text-align: right; color: #ffffff;">${booking.game || "Decide on arrival"}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a;"><strong>Players</strong></td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a; text-align: right; color: #ffffff;">${booking.players}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a;"><strong>Duration</strong></td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a; text-align: right; color: #ffffff;">${booking.durationHours} Hour(s)</td>
                        </tr>
                        <tr>
                          <td style="padding: 15px 0 5px 0;"><strong>Total Price</strong></td>
                          <td style="padding: 15px 0 5px 0; text-align: right; color: #ff4500; font-size: 18px; font-weight: bold;">₹${booking.totalPrice}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Action -->
                    <div style="margin-top: 40px; text-align: center;">
                      <p style="color: #a0a0a0; font-size: 14px; margin-bottom: 15px;">Please present your QR Pass upon arrival at the arena.</p>
                      <a href="${qrViewUrl}" style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #ff4500 0%, #ff8c00 100%); color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(255, 69, 0, 0.3);">
                        View Your QR Pass
                      </a>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="background-color: #111111; padding: 25px; text-align: center; border-top: 1px solid #222;">
                    <p style="margin: 0; color: #666666; font-size: 12px;">
                      <strong>JKS Arena</strong> • Gaming & Simulator Lounge<br>
                      Check the attached PDF for an offline copy of your pass.
                    </p>
                  </div>

                </div>
              `,

              attachments: [
                {
                  filename:
                    `booking-${qrId}.pdf`,

                  content:
                    pdfBuffer,

                  contentType:
                    "application/pdf",
                },
              ],
            });

            console.log(
              `✅ Booking email sent to ${emailUser.email} for booking ${qrId}`
            );

          } catch (emailErr) {

            console.error(
              `❌ Email failed for ${emailUser?.email || "unknown"} (booking ${qrId}, device ${booking.device}):`,
              emailErr.message || emailErr
            );

          }
        })();

      } else if (emailUser?.email) {

        console.log(
          `ℹ️  Email skipped for ${emailUser.email} — bookingUpdates notifications disabled`
        );

      }

      return res.status(201).json({
        booking,
        emailQueued: !!(emailUser?.email && emailUser?.notifications?.bookingUpdates !== false),
      });

    } catch (err) {

      return next(err);

    }

  }
);

// =========================================================
// 🔥 GET PLANS
// =========================================================

router.get(
  "/plans",
  authenticate,
  async (req, res, next) => {

    try {

      await ensureDefaultPlans();

      const plans =
        await Plan.find({
          isActive: true,
        })
          .sort({
            priceMonthly: 1,
          })
          .lean();

      return res.json({
        plans,
      });

    } catch (err) {

      return next(err);

    }

  }
);

// =========================================================
// 🔥 CANCEL BOOKING (user)
// =========================================================

router.patch(
  "/bookings/:id/cancel",
  authenticate,
  async (req, res, next) => {

    try {

      const booking =
        await Booking.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!booking) {

        return res
          .status(404)
          .json({ message: "Booking not found." });

      }

      if (booking.status !== "upcoming") {

        return res
          .status(400)
          .json({
            message:
              "Only upcoming bookings can be cancelled.",
          });

      }

      // Must be at least 30 minutes before slot start
      const now = Date.now();
      const cutoff =
        new Date(booking.slotStart).getTime() -
        30 * 60 * 1000;

      if (now >= cutoff) {

        return res
          .status(400)
          .json({
            message:
              "Too late to cancel. You can only cancel up to 30 minutes before your session.",
          });

      }

      booking.status = "cancelled";
      booking.sessionStatus = "cancelled";
      await booking.save();

      return res.json({
        booking,
        message: "Booking cancelled successfully.",
      });

    } catch (err) {

      return next(err);

    }

  }
);

// =========================================================
// 🔥 RESCHEDULE BOOKING (user)
// =========================================================

router.patch(
  "/bookings/:id/reschedule",
  authenticate,
  async (req, res, next) => {
    try {
      const booking = await Booking.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      if (booking.status !== "upcoming") {
        return res.status(400).json({
          message: "Only upcoming bookings can be rescheduled.",
        });
      }

      const { slotStart, durationHours, device } = req.body;
      if (!slotStart || !durationHours || !device) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const newStart = new Date(slotStart);
      const newEnd = new Date(newStart.getTime() + Number(durationHours) * 60 * 60 * 1000);

      // Must be at least 30 mins before CURRENT slot start
      const now = Date.now();
      const cutoff = new Date(booking.slotStart).getTime() - 30 * 60 * 1000;
      if (now >= cutoff) {
        return res.status(400).json({
          message: "Too late to reschedule. You can only reschedule up to 30 minutes before your session.",
        });
      }

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
        const newRate = DEVICE_RATES[device] || 60;
        booking.perHeadRate = newRate;
        const rawTotal = Number(booking.players || 1) * newRate * booking.durationHours;
        booking.totalPrice = Math.round(rawTotal);
        
        const paid = Number(booking.amountPaid || 0);
        booking.paymentStatus = paid >= booking.totalPrice ? "paid" : "partial";
      }

      await booking.save();

      return res.json({
        booking,
        message: "Booking rescheduled successfully.",
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;