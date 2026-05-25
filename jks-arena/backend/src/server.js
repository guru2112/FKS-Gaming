const path = require("path");
const dotenv = require("dotenv");
const dns = require("dns");

// ✅ Load env BEFORE anything else
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ✅ Force Node.js to use IPv4 first for all DNS lookups
// This fixes the ENETUNREACH error caused by Render's broken IPv6 routing to Google SMTP
dns.setDefaultResultOrder("ipv4first");

const app = require("./app");
const { connectDb } = require("./db");
const { verifyConnection } = require("./utils/mailer");
const {
  cancelExpiredBookings,
  completeExpiredSessions,
} = require("./utils/bookingCleanup");
const { scrapeReviews } = require("./utils/reviewsScraper");
const { startCronJobs } = require("./utils/cron");

// ✅ Verify critical env vars on startup
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingVars);
  process.exit(1);
}

// ✅ Warn if Brevo API Key is missing (non-fatal — booking still works, just no emails)
const brevoVars = ["BREVO_API_KEY"];
const missingBrevo = brevoVars.filter((v) => !process.env[v]);
if (missingBrevo.length > 0) {
  console.warn("⚠️  Missing Brevo API Key:", missingBrevo, "— booking emails will NOT be sent.");
}

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    console.log("✅ Database connected");

    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

      // Verify Brevo API connection (non-fatal — warn only)
      if (missingBrevo.length === 0) {
        verifyConnection().then((api) => {
          if (api.ok) {
            console.log("✅ Brevo Email API connection verified");
          } else {
            console.warn("⚠️  Brevo Email API connection failed:", api.error);
            console.warn("   Booking emails will fail. Check BREVO_API_KEY.");
          }
        });
      }

      // Initialize Cron Jobs (e.g. Booking Reminders)
      startCronJobs();

      // Background job: auto-cancel no-shows + auto-complete sessions (every 5 min)
      setInterval(async () => {
        try {
          await cancelExpiredBookings();
          await completeExpiredSessions();
        } catch (err) {
          console.error("❌ Booking cleanup job failed:", err.message);
        }
      }, 5 * 60 * 1000);

      // Background job: Google Reviews Scraper (every 72 hours)
      setInterval(async () => {
        try {
          await scrapeReviews();
        } catch (err) {
          console.error("❌ Reviews scraper job failed:", err.message);
        }
      }, 72 * 60 * 60 * 1000);

      // Run once immediately on startup
      (async () => {
        try {
          await cancelExpiredBookings();
          await completeExpiredSessions();
          
          const Review = require("./models/Review");
          const count = await Review.countDocuments();
          if (count === 0) {
            console.log("⚠️ No reviews found in DB. Running initial scrape...");
            scrapeReviews(); // Run asynchronously without awaiting to not block server startup
          }
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