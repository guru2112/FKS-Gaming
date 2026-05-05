const express = require("express");
const MediaItem = require("../models/MediaItem");

const router = express.Router();

function normalizeCategory(value) {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  if (key === "games" || key === "game") return "Games";
  if (key === "food" || key === "foods") return "Food";
  if (key === "drinks" || key === "drink") return "Drinks";
  return null;
}

router.get("/", async (req, res, next) => {
  try {
    const category = normalizeCategory(req.query.category);
    const query = category ? { category } : {};

    const items = await MediaItem.find(query)
      .select("-publicId")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
