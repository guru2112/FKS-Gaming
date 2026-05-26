const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const OTP = require("../models/OTP");

const { authenticate } = require("../middleware/auth");
const { sendWhatsAppOTP } = require("../utils/whatsapp");

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
        phone,
        avatarUrl,
        topbarUrl,
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
      // 🔥 PHONE
      // =========================================================

      if (phone !== undefined) {
        updates.phone = phone.trim();
        // Since we are removing OTP, we can just mark it verified or ignore the flag
        updates.isPhoneVerified = true; 
      }

      // =========================================================
      // 🔥 AVATAR
      // =========================================================

      if (avatarUrl !== undefined) {
        updates.avatarUrl =
          avatarUrl;
      }

      // =========================================================
      // 🔥 TOPBAR
      // =========================================================

      if (topbarUrl !== undefined) {
        updates.topbarUrl =
          topbarUrl;
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
// 🔥 SEND WHATSAPP OTP
// =========================================================

router.post(
  "/send-whatsapp-otp",
  authenticate,
  async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ message: "Phone number is required." });
      }

      // Generate a 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Upsert OTP in database
      await OTP.findOneAndUpdate(
        { phone },
        { otpCode, createdAt: new Date() },
        { upsert: true, new: true }
      );

      // Send via WhatsApp
      await sendWhatsAppOTP(phone, otpCode);

      res.json({ message: "OTP sent successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to send OTP." });
    }
  }
);

// =========================================================
// 🔥 VERIFY PHONE (via WhatsApp OTP)
// =========================================================

router.put(
  "/verify-phone",
  authenticate,
  async (req, res) => {
    try {
      const { phone, name, otpCode } = req.body;

      if (!phone || !otpCode) {
        return res.status(400).json({ message: "Phone number and OTP code are required." });
      }

      // Check OTP
      const record = await OTP.findOne({ phone, otpCode });
      if (!record) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
      }

      const updates = {
        phone: phone.trim(),
        isPhoneVerified: true,
      };

      if (name) {
        updates.name = name.trim();
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true, runValidators: false }
      ).lean();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      // Delete the OTP after successful verification
      await OTP.deleteOne({ _id: record._id });

      delete updatedUser.passwordHash;

      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
      });

      res.json({
        message: "Phone verified successfully!",
        user: updatedUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error verifying phone." });
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