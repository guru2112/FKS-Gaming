require("dotenv").config();
const mongoose = require("mongoose");
const { scrapeReviews } = require("./src/utils/reviewsScraper");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB:", process.env.MONGODB_URI.split("@")[1]);
  await scrapeReviews();
  process.exit(0);
}

run();
