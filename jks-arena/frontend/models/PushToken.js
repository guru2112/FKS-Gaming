import mongoose from "mongoose";

const pushTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: { type: String, required: true, unique: true },
  platform: { type: String, default: "web" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PushToken || mongoose.model("PushToken", pushTokenSchema);
