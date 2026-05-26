const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    // =========================================================
    // 🔥 PROFILE
    // =========================================================

    avatarUrl: {
      type: String,
      default: "",
    },

    topbarUrl: {
      type: String,
      default: "",
    },

    // =========================================================
    // 🔥 NOTIFICATION SETTINGS
    // =========================================================

    notifications: {

      bookingUpdates: {
        type: Boolean,
        default: true,
      },

      promotions: {
        type: Boolean,
        default: true,
      },

      reminders: {
        type: Boolean,
        default: true,
      },

    },

    // =========================================================
    // 🔥 RESET PASSWORD
    // =========================================================

    resetOTP: {
      type: String,
      default: null,
    },

    resetOTPExpires: {
      type: Date,
      default: null,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema,
  "Users"
);