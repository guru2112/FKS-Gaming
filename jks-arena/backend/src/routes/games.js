const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const { requireAdmin } = require("../middleware/auth");

// Public route to get all games
router.get("/", async (req, res) => {
  try {
    const games = await Game.find().sort({ title: 1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch games", error: err.message });
  }
});

// Admin route to add a game manually
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    // Normalize string: remove spaces, hyphens, and convert to lowercase for comparison
    const normalize = (str) => str.toLowerCase().replace(/[\s-]/g, "");
    const normalizedTitle = normalize(title);
    
    const allGames = await Game.find();
    const exists = allGames.find(g => normalize(g.title) === normalizedTitle);
    
    if (exists) return res.status(400).json({ message: "Game already exists" });
    const game = await Game.create({ title });
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ message: "Failed to create game", error: err.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Game not found" });
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
