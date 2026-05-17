const path = require("path");
const dotenv = require("dotenv");

// ✅ Load env BEFORE anything else
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const { connectDb } = require("./db");

// ✅ Verify critical env vars on startup
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingVars);
  process.exit(1);
}

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    console.log("✅ Database connected");

    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();