const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
const MediaItem = require("./src/models/MediaItem");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const logo = await MediaItem.findOne({ category: "Logo" }).sort({ createdAt: -1 });
  console.log("LOGO_URL:", logo ? logo.secure_url : "NOT FOUND");
  process.exit(0);
}
run();
