const path = require("path");
const dotenv = require("dotenv");

// 🔥 FIX: load env BEFORE anything else
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = require("./app");
const { connectDb } = require("./db");

console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    console.log("✅ Database connected");

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();