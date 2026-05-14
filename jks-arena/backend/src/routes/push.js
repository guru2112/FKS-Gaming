const express =
  require("express");

const router =
  express.Router();

const PushToken =
  require("../models/PushToken");

const {
  authenticate,
} = require("../middleware/auth");

// =========================================================
// 🔥 REGISTER PUSH TOKEN
// =========================================================

router.post(
  "/register",

  authenticate,

  async (req, res) => {

    try {

      const {
        token,
      } = req.body;

      if (!token) {

        return res.status(400).json({

          message:
            "Token required.",

        });

      }

      // =====================================================
      // 🔥 UPSERT TOKEN (IDEMPOTENT)
      // =====================================================

      await PushToken.findOneAndUpdate(

        {
          token,
        },

        {
          userId:
            req.userId,

          token,

          platform:
            "web",

          createdAt:
            new Date(),
        },

        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }

      );

      return res.json({

        success:
          true,

      });

    } catch (err) {

      // Duplicate token insert/update should behave as success.
      if (
        err &&
        typeof err === "object" &&
        err.code === 11000
      ) {
        return res.json({
          success: true,
        });
      }

      console.error(err);

      return res.status(500).json({

        message:
          "Failed to save push token.",

      });

    }

  }
);

module.exports =
  router;