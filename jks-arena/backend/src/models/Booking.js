const mongoose = require("mongoose");

const companionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }
});

const bookingSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ["online", "offline"], default: "online" },
    sessionStatus: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled"],
      default: "scheduled",
    },
    walkInCustomer: { type: Boolean, default: false },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.source !== "offline";
      },
    },
    userName: { type: String, required: true },
    userContact: { type: String, required: true },
    
    // 🔥 Added for guest access and unique lookups
    qrId: { type: String, unique: true, required: true }, 
    
    device: { type: String, enum: ["PS1", "PS2", "PS3", "SIM1"], required: true },
    slotStart: { type: Date, required: true },
    slotEnd: { type: Date, required: true },
    
    // 🔥 Added for validity check during scanning
    expiryTime: { type: Date, required: true }, 
    
    // Can be fractional for offline sessions (e.g., 2.5 hours)
    durationHours: { type: Number, required: true, min: 0 },

    // Admin-friendly timing fields (kept in sync with slotStart/slotEnd)
    inTime: { type: Date },
    outTime: { type: Date },
    game: { type: String, default: "" },
    rig: { type: String },
    players: { type: Number, required: true, min: 1 },
    companions: [companionSchema],
    contactNumber: { type: String },
    perHeadRate: { type: Number, min: 0 },
    
    totalPrice: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash", "online"] },
    amountPaid: { type: Number, min: 0, default: 0 },
    paymentStatus: { type: String, enum: ["paid", "partial"] },
    status: { type: String, enum: ["upcoming", "active", "completed", "cancelled", "no-show"], default: "upcoming" },
    actualStartTime: { type: Date }, 
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ device: 1, slotStart: 1, slotEnd: 1, status: 1 });
bookingSchema.index({ source: 1, sessionStatus: 1 });
bookingSchema.index({ status: 1, slotStart: 1 }); // auto-cancel / auto-complete queries

module.exports = mongoose.model("Booking", bookingSchema, "Bookings");