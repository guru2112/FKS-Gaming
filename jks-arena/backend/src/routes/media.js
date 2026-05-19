const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const MediaItem = require("../models/MediaItem");

const { requireAdmin } = require("../middleware/auth"); 

router.get("/", async (req, res) => {
  try {
    const items = await MediaItem.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch media", error: err.message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    // 🔥 Extract facilityType
    const { name, description, category, gameName, view, profileImageType, facilityType, dashboardType, file } = req.body;

    if (!file) return res.status(400).json({ message: "No file provided" });
    if (!file.startsWith("data:image")) return res.status(400).json({ message: "Invalid image format" });

    const uploadRes = await cloudinary.uploader.upload(file, {
      folder: `Photos/${category}`,
    });

    // 🔥 Save facilityType to DB
    const media = await MediaItem.create({
      name,
      description,
      category,
      gameName,
      view,
      profileImageType,
      facilityType,
      dashboardType,
      secure_url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    });

    res.status(201).json(media);

  } catch (err) {
    console.error("❌ FULL ERROR:", err); 
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const item = await MediaItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });

    await cloudinary.uploader.destroy(item.public_id);
    await MediaItem.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;