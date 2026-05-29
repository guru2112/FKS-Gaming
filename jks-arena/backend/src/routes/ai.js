// backend/src/routes/ai.js
const express = require("express");
const { handleChat } = require("../controllers/aiController");
const { optionalAuth } = require("../middleware/optionalAuth");

const router = express.Router();

router.post("/chat", optionalAuth, handleChat);

module.exports = router;
