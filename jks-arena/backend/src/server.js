const path = require("path");
const dotenv = require("dotenv");

// ✅ Load env BEFORE anything else
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const { connectDb } = require("./db");
const { verifyConnection } = require("./utils/mailer");
const {
  cancelExpiredBookings,
  completeExpiredSessions,
} = require("./utils/bookingCleanup");

// ✅ Verify critical env vars on startup
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingVars);
  process.exit(1);
}

// ✅ Warn if SMTP credentials are missing (non-fatal — booking still works, just no emails)
const smtpVars = ["MAIL_USERNAME", "MAIL_PASSWORD"];
const missingSmtp = smtpVars.filter((v) => !process.env[v]);
if (missingSmtp.length > 0) {
  console.warn("⚠️  Missing SMTP credentials:", missingSmtp, "— booking emails will NOT be sent.");
}

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    console.log("✅ Database connected");

    // Verify SMTP connection (non-fatal — warn only)
    if (missingSmtp.length === 0) {
      const smtp = await verifyConnection();
      if (smtp.ok) {
        console.log("✅ SMTP connection verified");
      } else {
        console.warn("⚠️  SMTP connection failed:", smtp.error);
        console.warn("   Booking emails will fail. Check MAIL_USERNAME and MAIL_PASSWORD.");
      }
    }

    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

      // Background job: auto-cancel no-shows + auto-complete sessions (every 5 min)
      setInterval(async () => {
        try {
          await cancelExpiredBookings();
          await completeExpiredSessions();
        } catch (err) {
          console.error("❌ Booking cleanup job failed:", err.message);
        }
      }, 5 * 60 * 1000);

      // Run once immediately on startup
      (async () => {
        try {
          await cancelExpiredBookings();
          await completeExpiredSessions();
        } catch (err) {
          console.error("❌ Initial cleanup failed:", err.message);
        }
      })();
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();