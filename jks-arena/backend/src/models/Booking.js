const mongoose = require("mongoose");

const companionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }
});

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Primary User Details
    userName: { type: String, required: true },
    userContact: { type: String, required: true },
    
    device: { type: String, enum: ["PS1", "PS2", "PS3", "SIM1"], required: true },
    slotStart: { type: Date, required: true },
    slotEnd: { type: Date, required: true },
    durationHours: { type: Number, required: true, min: 1 },
    
    game: { type: String, default: "" },
    rig: { type: String },
    players: { type: Number, required: true, min: 1 },
    companions: [companionSchema],
    contactNumber: { type: String },
    perHeadRate: { type: Number, min: 0 },
    
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema, "Bookings");