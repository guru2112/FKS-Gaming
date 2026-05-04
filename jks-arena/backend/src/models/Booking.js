const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    game: {
      type: String,
      trim: true,
      default: "",
    },
    device: {
      type: String,
      enum: ["PS1", "PS2", "PS3", "SIM1"],
      required: true,
    },
    slotStart: {
      type: Date,
      required: true,
    },
    slotEnd: {
      type: Date,
      required: true,
    },
    durationHours: {
      type: Number,
      required: true,
      min: 1,
    },
    players: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    perHeadRate: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    rig: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema, "Bookings");
