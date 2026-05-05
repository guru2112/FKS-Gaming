const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    category: {
      type: String,
      enum: ["Games", "Food", "Drinks"],
      required: true,
    },

    gameName: { type: String },

    secure_url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MediaItem", mediaSchema);