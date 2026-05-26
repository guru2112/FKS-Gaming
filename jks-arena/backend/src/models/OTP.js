const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    otpCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // Auto-delete after 5 minutes (300 seconds)
  }
);

// Index to quickly look up OTPs by phone number
otpSchema.index({ phone: 1 });

module.exports = mongoose.model("OTP", otpSchema, "OTPs");
