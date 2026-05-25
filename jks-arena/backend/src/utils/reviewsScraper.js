const { chromium } = require("playwright");
const Review = require("../models/Review");
const path = require("path");

async function scrapeReviews() {
  let context = null;
  try {
    console.log("🔄 Starting Google Reviews scraper...");

    // Launch persistent browser in headless mode
    // We use a specific playwright-data dir in the backend root
    const userDataDir = path.resolve(__dirname, "../../playwright-data");
    
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: true,
      viewport: {
        width: 1400,
        height: 1000,
      },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--no-sandbox",
      ],
    });

    const page = await context.newPage();

    // DIRECT REVIEWS URL
    const URL =
      "https://www.google.com/maps/place/JKS+ARENA/data=!4m7!3m6!1s0x3be7c73282ba6551:0xf46e539b69fc8615!8m2!3d19.1135768!4d72.9320667!9m1!1b1";

    console.log("📍 Opening Google Maps Reviews URL...");

    await page.goto(URL, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    // Wait for rendering
    await page.waitForTimeout(10000);

    // Bypass webdriver detection
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    // WAIT FOR REVIEWS
    await page.waitForSelector(".jftiEf", {
      timeout: 120000,
    });

    console.log("✅ Reviews loaded successfully.");

    // FIND REVIEW SCROLL CONTAINER
    const scrollContainer = await page.$('.m6QErb.DxyBCb.kA9KIf.dS8AEf');

    if (!scrollContainer) {
      console.log("❌ Review container not found. Scraper aborted.");
      await context.close();
      return;
    }

    console.log("📜 Scrolling reviews...");

    // AUTO SCROLL
    for (let i = 0; i < 20; i++) {
      await scrollContainer.evaluate((el) => {
        el.scrollBy(0, 3000);
      });

      console.log(`⏳ Scrolled ${i + 1}/20`);
      await page.waitForTimeout(2000);
    }

    console.log("⛏️  Extracting reviews...");

    // EXTRACT REVIEWS
    const reviewsData = await page.$$eval(".jftiEf", (cards) => {
      return cards.map((card) => {
        const name = card.querySelector(".d4r55")?.innerText?.trim() || "Unknown";
        const reviewText = card.querySelector(".wiI7pd")?.innerText?.trim() || "No comment";
        const ratingStr = card.querySelector('span[role="img"]')?.getAttribute("aria-label") || "0";
        const date = card.querySelector(".rsqaWe")?.innerText?.trim() || "Unknown date";
        
        // Parse rating string (e.g. "5 stars" -> 5)
        const rating = parseInt(ratingStr.replace(/\D/g, ""), 10) || 5;

        return {
          name,
          rating,
          date,
          comment: reviewText,
          source: "Google"
        };
      });
    });

    console.log(`✅ Extracted ${reviewsData.length} reviews.`);

    if (reviewsData.length > 0) {
      // Clear old reviews and insert new ones
      await Review.deleteMany({});
      await Review.insertMany(reviewsData);
      console.log("💾 Reviews successfully saved to database.");
    } else {
      console.log("⚠️ No reviews extracted. Database not updated.");
    }

  } catch (error) {
    console.error("❌ Google Reviews scraping failed:", error.message);
  } finally {
    if (context) {
      await context.close();
      console.log("🔒 Browser context closed.");
    }
  }
}

module.exports = { scrapeReviews };
