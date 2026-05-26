const MediaItem = require("../../models/MediaItem");
const { uploadImageBuffer, deleteImage } = require("../../utils/cloudinary");

exports.getMedia = async (req, res, next) => {
  try {
    const items = await MediaItem.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.createMedia = async (req, res, next) => {
  try {
    console.log("🔥 Admin upload request");

    const { name, category, gameName, file } = req.body;

    if (!file || !name || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!file.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    const buffer = Buffer.from(file.split(",")[1], "base64");

    const uploadRes = await uploadImageBuffer(buffer, {
      folder: `Photos/${category}`,
    });

    const item = await MediaItem.create({
      name,
      category,
      gameName,
      secure_url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    });

    console.log("✅ Saved:", item._id);

    res.status(201).json({ item });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

exports.updateMedia = async (req, res, next) => {
  try {
    const item = await MediaItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Media item not found" });
    }

    const update = {};

    if (req.body.name) update.name = req.body.name;
    if (req.body.category) update.category = req.body.category;
    if (req.body.gameName) update.gameName = req.body.gameName;

    if (req.body.file) {
      if (!req.body.file.startsWith("data:image")) {
        return res.status(400).json({ message: "Invalid image format" });
      }

      const buffer = Buffer.from(req.body.file.split(",")[1], "base64");

      const uploadRes = await uploadImageBuffer(buffer, {
        folder: `Photos/${req.body.category || item.category}`,
      });

      update.secure_url = uploadRes.secure_url;
      update.public_id = uploadRes.public_id;

      await deleteImage(item.public_id);
    }

    const updated = await MediaItem.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteMedia = async (req, res, next) => {
  try {
    const item = await MediaItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Media item not found" });
    }

    await deleteImage(item.public_id);
    await item.deleteOne();

    res.json({ message: "Media item deleted" });
  } catch (err) {
    next(err);
  }
};
