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