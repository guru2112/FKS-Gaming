import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    topbarUrl: { type: String, default: "" },
    notifications: {
      bookingUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },
    resetOTP: { type: String, default: null },
    resetOTPExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema, "Users");
