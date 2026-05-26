const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailLog", emailLogSchema);
