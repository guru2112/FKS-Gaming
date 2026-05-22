import mongoose from "mongoose";

const comboSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    items: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    durationHours: { type: Number, required: true, min: 1 },
    description: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Combo || mongoose.model("Combo", comboSchema, "Combos");
