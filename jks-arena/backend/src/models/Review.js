const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      trim: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      default: "Google",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
