const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews
 * @access  Public
 */
router.get("/", async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    next(error);
  }
});

module.exports = router;
