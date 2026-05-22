import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["Games", "Food", "Drinks", "Application", "Profile", "Facilities", "Dashboard"],
      required: true,
    },
    gameName: { type: String },
    view: { type: String },
    profileImageType: { type: String, enum: ["Avatar"] },
    facilityType: {
      type: String,
      enum: ["Screen", "PS", "Seating", "Simulator", "Multiplayer"],
    },
    dashboardType: {
      type: String,
      enum: ["Sidebar", "Timer Card", "Mobile Menu", "Details Card", "Topbar", "PS", "Simulator", "Book Button"],
    },
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.MediaItem || mongoose.model("MediaItem", mediaSchema);
