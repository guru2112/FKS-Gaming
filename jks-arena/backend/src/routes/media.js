const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const MediaItem = require("../models/MediaItem");

const { requireAdmin } = require("../middleware/auth"); 
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", async (req, res) => {
  try {
    const items = await MediaItem.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch media", error: err.message });
  }
});

router.get("/logo", async (req, res) => {
  try {
    const logo = await MediaItem.findOne({ category: "Logo" }).sort({ createdAt: -1 });
    if (!logo) return res.status(404).json({ message: "No logo found" });
    res.json(logo);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logo", error: err.message });
  }
});

router.post("/", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    // 🔥 Extract properties
    const { name, description, category, gameName, view, profileImageType, facilityType, dashboardType } = req.body;

    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUri = "data:" + req.file.mimetype + ";base64," + b64;

    let subFolder = "";
    if (category === "Games" && gameName) subFolder = gameName;
    else if (category === "Facilities" && facilityType) subFolder = facilityType;
    else if (category === "Dashboard" && dashboardType) subFolder = dashboardType;
    else if (category === "Application" && view) subFolder = view;
    else if (category === "Profile" && profileImageType) subFolder = profileImageType;

    const folderPath = subFolder ? `Photos/${category}/${subFolder}` : `Photos/${category}`;

    const uploadRes = await cloudinary.uploader.upload(dataUri, {
      folder: folderPath,
    });

    // 🔥 Save to DB
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