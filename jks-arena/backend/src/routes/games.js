const express = require("express");
const router = express.Router();
const Game = require("../models/Game");

// Default games to seed if collection is empty
const DEFAULT_GAMES = [
  "FIFA 24",
  "FIFA 25",
  "Tekken 8",
  "GTA V",
  "Call of Duty",
  "Mortal Kombat 1",
  "WWE 2K24",
  "Forza Horizon 5"
];

// Seed games if empty
async function seedGames() {
  try {
    const count = await Game.countDocuments();
    if (count === 0) {
      console.log("🌱 Seeding default games...");
      const gamesToInsert = DEFAULT_GAMES.map(title => ({ title, isActive: true }));
      await Game.insertMany(gamesToInsert);
      console.log("✅ Default games seeded successfully.");
    }
  } catch (err) {
    console.error("❌ Error seeding games:", err);
  }
}

// Call seed function on load
seedGames();

// GET /api/games
router.get("/", async (req, res) => {
  try {
    const games = await Game.find({ isActive: true }).sort({ title: 1 });
    res.json(games);
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

module.exports = router;
