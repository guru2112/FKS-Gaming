const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const MediaItem = require("../models/MediaItem");

router.post("/", async (req, res) => {
  try {
    console.log("🔥 Upload request received");

    const { name, category, gameName, file } = req.body;

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // 🔥 FIX: ensure base64 format
    let uploadFile = file;

    if (!file.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    console.log("Uploading to Cloudinary...");

    const uploadRes = await cloudinary.uploader.upload(uploadFile, {
      folder: `Photos/${category}`,
    });

    console.log("Cloudinary success:", uploadRes.secure_url);

    const media = await MediaItem.create({
      name,
      category,
      gameName,
      secure_url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    });

    console.log("Saved to DB");

    res.status(201).json(media);
  } catch (err) {
    console.error("❌ FULL ERROR:", err); // 🔥 IMPORTANT
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

router.get("/", async (req, res) => {
  const items = await MediaItem.find().sort({ createdAt: -1 });
  res.json({ items });
});

router.delete("/:id", async (req, res) => {
  const item = await MediaItem.findById(req.params.id);

  if (!item) return res.status(404).json({ message: "Not found" });

  await cloudinary.uploader.destroy(item.public_id);
  await MediaItem.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted" });
});

module.exports = router;