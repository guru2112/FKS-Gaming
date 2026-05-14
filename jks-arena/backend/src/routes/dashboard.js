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

// =========================================================
// 🔥 DEVICE RATES
// =========================================================

const DEVICE_RATES = {
  PS1: 60,
  PS2: 60,
  PS3: 60,
  SIM1: 100,
};

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
          "name email planId"
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found.",
        });

      }

      let plan = null;

      if (user.planId) {

        plan =
          await Plan.findById(
            user.planId
          ).select(
            "name priceMonthly perks"
          );

      }

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

      await Booking.updateMany(
        {
          userId:
            req.userId,

          status:
            "upcoming",

          slotEnd: {
            $exists: true,
            $lt: now,
          },
        },
        {
          $set: {
            status:
              "completed",
          },
        }
      );

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
            companions || [],

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
          "Booking Confirmed",

        message:
          `Your ${booking.device} session has been booked successfully.`,

        type:
          "booking",

        link:
          "/dashboard",
      });

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
      // SEND EMAIL
      // =====================================================

      if (
        user?.email &&
        user?.notifications
          ?.bookingUpdates !== false
      ) {

        try {

          const qrViewUrl =
            `${process.env.FRONTEND_URL || "http://192.168.1.16:3000"}/qr/${qrId}`;

          const qrPng =
            await createQrPngBuffer(
              qrViewUrl
            );

          const pdfBuffer =
            await buildBookingPdf({
              booking,
              user,
              qrPng,
            });

          const from =
            process.env.MAIL_FROM ||
            process.env.MAIL_USERNAME;

          await sendMail({
            from,

            to:
              user.email,

            subject:
              "Your JKS Arena Access Pass",

            html: `
              <div style="font-family:Arial,sans-serif;padding:20px;">

                <h2 style="color:#ff6b35;">
                  Booking Confirmed 🎮
                </h2>

                <p>
                  Hi <strong>${user.name}</strong>,
                </p>

                <p>
                  Your booking has been successfully confirmed.
                </p>

                <div style="margin-top:20px;padding:15px;border:1px solid #eee;border-radius:10px;background:#fafafa;">

                  <p><strong>Device:</strong> ${booking.device}</p>

                  <p><strong>Players:</strong> ${booking.players}</p>

                  <p><strong>Duration:</strong> ${booking.durationHours} Hour(s)</p>

                  <p><strong>Total:</strong> ₹${booking.totalPrice}</p>

                </div>

                <p style="margin-top:20px;">
                  Your QR Pass:
                </p>

                <a
                  href="${qrViewUrl}"
                  style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#ff6b35;
                    color:white;
                    border-radius:8px;
                    text-decoration:none;
                    font-weight:bold;
                  "
                >
                  View QR Pass
                </a>

                <p style="margin-top:30px;color:#777;font-size:12px;">
                  JKS Arena • Gaming & Simulator Lounge
                </p>

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
            "✅ Booking email sent."
          );

        } catch (emailErr) {

          console.error(
            "❌ Email error:",
            emailErr
          );

        }

      }

      return res.status(201).json({
        booking,
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

module.exports = router;