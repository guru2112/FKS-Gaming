const mongoose = require("mongoose");

const mediaItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: ["Games", "Food", "Drinks"],
      required: true,
    },
    price: {
      type: String,
      default: "",
      trim: true,
    },
    flavor: {
      type: String,
      default: "",
      trim: true,
    },
    packSize: {
      type: String,
      default: "",
      trim: true,
    },
    itemType: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    folder: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MediaItem", mediaItemSchema, "MediaItems");
