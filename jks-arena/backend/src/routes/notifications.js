const express = require("express");

const Notification =
  require("../models/Notification");

const {
  authenticate,
} = require("../middleware/auth");

const router =
  express.Router();

// =========================================================
// 🔥 GET NOTIFICATIONS
// =========================================================

router.get(
  "/",
  authenticate,

  async (req, res, next) => {

    try {

      const notifications =
        await Notification.find({

          userId:
            req.userId,

        })
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        notifications,
      });

    } catch (err) {

      return next(err);

    }

  }
);

// =========================================================
// 🔥 MARK READ
// =========================================================

router.patch(
  "/:id/read",
  authenticate,

  async (req, res, next) => {

    try {

      await Notification.findOneAndUpdate(

        {
          _id:
            req.params.id,

          userId:
            req.userId,

        },

        {
          isRead: true,
        }

      );

      return res.json({
        success: true,
      });

    } catch (err) {

      return next(err);

    }

  }
);

// =========================================================
// 🔥 MARK ALL READ
// =========================================================

router.patch(
  "/read-all",
  authenticate,

  async (req, res, next) => {

    try {

      await Notification.updateMany(

        {
          userId:
            req.userId,

          isRead: false,
        },

        {
          isRead: true,
        }

      );

      return res.json({
        success: true,
      });

    } catch (err) {

      return next(err);

    }

  }
);

module.exports =
  router;