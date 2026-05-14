const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

// =========================================================
// 🔥 UPDATE PROFILE
// =========================================================

router.put(
  "/profile",
  authenticate,
  async (req, res) => {
    try {
      const {
        name,
        email,
        avatarUrl,
      } = req.body;

      const updates = {};

      // =========================================================
      // 🔥 NAME
      // =========================================================

      if (name) {
        updates.name = name.trim();
      }

      // =========================================================
      // 🔥 EMAIL
      // =========================================================

      if (email) {
        const normalizedEmail = email
          .toLowerCase()
          .trim();

        // 🔥 CHECK IF EMAIL ALREADY EXISTS
        const existingUser =
          await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.userId },
          });

        if (existingUser) {
          return res.status(409).json({
            message:
              "Email already in use.",
          });
        }

        updates.email =
          normalizedEmail;
      }

      // =========================================================
      // 🔥 AVATAR
      // =========================================================

      if (avatarUrl !== undefined) {
        updates.avatarUrl =
          avatarUrl;
      }

      // =========================================================
      // 🔥 UPDATE USER
      // =========================================================

      const updatedUser =
        await User.findByIdAndUpdate(
          req.userId,
          {
            $set: updates,
          },
          {
            new: true,
            runValidators: false,
          }
        ).lean();

      if (!updatedUser) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      // 🔥 REMOVE PASSWORD
      delete updatedUser.passwordHash;

      // 🔥 DISABLE CACHE
      res.set({
        "Cache-Control":
          "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
      });

      res.json({
        message:
          "Profile updated successfully!",
        user: updatedUser,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message:
          "Error updating profile.",
      });
    }
  }
);

// =========================================================
// 🔥 CHANGE PASSWORD
// =========================================================

router.put(
  "/change-password",
  authenticate,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      // =========================================================
      // 🔥 VALIDATION
      // =========================================================

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Current password and new password are required.",
        });
      }

      if (
        newPassword.length < 6
      ) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters.",
        });
      }

      // =========================================================
      // 🔥 GET USER
      // =========================================================

      const user =
        await User.findById(
          req.userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      // =========================================================
      // 🔥 CHECK CURRENT PASSWORD
      // =========================================================

      const isMatch =
        await bcrypt.compare(
          currentPassword,
          user.passwordHash
        );

      if (!isMatch) {
        return res.status(401).json({
          message:
            "Current password is incorrect.",
        });
      }

      // =========================================================
      // 🔥 CHECK SAME PASSWORD
      // =========================================================

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.passwordHash
        );

      if (samePassword) {
        return res.status(400).json({
          message:
            "New password cannot be the same as current password.",
        });
      }

      // =========================================================
      // 🔥 HASH NEW PASSWORD
      // =========================================================

      const passwordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      user.passwordHash =
        passwordHash;

      await user.save();

      res.json({
        message:
          "Password updated successfully!",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message:
          "Failed to change password.",
      });
    }
  }
);

// =========================================================
// 🔥 UPDATE NOTIFICATION SETTINGS
// =========================================================

router.put(
  "/notifications",
  authenticate,
  async (req, res) => {
    try {
      const {
        bookingUpdates,
        promotions,
        reminders,
      } = req.body;

      const user =
        await User.findById(
          req.userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      // =========================================================
      // 🔥 CREATE DEFAULT OBJECT
      // =========================================================

      if (!user.notifications) {
        user.notifications = {};
      }

      // =========================================================
      // 🔥 UPDATE SETTINGS
      // =========================================================

      if (
        bookingUpdates !==
        undefined
      ) {
        user.notifications.bookingUpdates =
          bookingUpdates;
      }

      if (
        promotions !==
        undefined
      ) {
        user.notifications.promotions =
          promotions;
      }

      if (
        reminders !==
        undefined
      ) {
        user.notifications.reminders =
          reminders;
      }

      await user.save();

      res.json({
        message:
          "Notification settings updated successfully!",
        notifications:
          user.notifications,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message:
          "Failed to update notifications.",
      });
    }
  }
);

// =========================================================
// 🔥 GET CURRENT USER
// =========================================================

router.get(
  "/me",
  authenticate,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.userId
        ).lean();

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      // 🔥 REMOVE PASSWORD
      delete user.passwordHash;

      // 🔥 DISABLE CACHE
      res.set({
        "Cache-Control":
          "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
      });

      console.log(
        "🔥 USER AVATAR:",
        user.avatarUrl
      );

      res.json(user);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);

module.exports = router;