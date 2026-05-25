const { chromium } = require("playwright");
const fs = require("fs");

async function scrapeReviews() {
  // Launch persistent browser
  const context = await chromium.launchPersistentContext(
    "./playwright-data",
    {
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
    }
  );

  const page = await context.newPage();

  // DIRECT REVIEWS URL
  const URL =
    "https://www.google.com/maps/place/JKS+ARENA/data=!4m7!3m6!1s0x3be7c73282ba6551:0xf46e539b69fc8615!8m2!3d19.1135768!4d72.9320667!9m1!1b1";

  console.log("\nOpening Google Maps Reviews...\n");

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

  console.log("Reviews loaded successfully.\n");

  // FIND REVIEW SCROLL CONTAINER
  const scrollContainer = await page.$(
    '.m6QErb.DxyBCb.kA9KIf.dS8AEf'
  );

  if (!scrollContainer) {
    console.log("Review container not found.");
    await context.close();
    return;
  }

  console.log("Scrolling reviews...\n");

  // AUTO SCROLL
  for (let i = 0; i < 20; i++) {
    await scrollContainer.evaluate((el) => {
      el.scrollBy(0, 3000);
    });

    console.log(`Scrolled ${i + 1}/20`);

    await page.waitForTimeout(2000);
  }

  console.log("\nExtracting reviews...\n");

  // EXTRACT REVIEWS
  const reviews = await page.$$eval(".jftiEf", (cards) => {
    return cards.map((card) => {
      const name =
        card.querySelector(".d4r55")?.innerText?.trim() ||
        "Unknown";

      const review =
        card.querySelector(".wiI7pd")?.innerText?.trim() ||
        "No comment";

      const rating =
        card
          .querySelector('span[role="img"]')
          ?.getAttribute("aria-label") ||
        "No rating";

      const date =
        card.querySelector(".rsqaWe")?.innerText?.trim() ||
        "Unknown date";

      return {
        name,
        rating,
        date,
        review,
      };
    });
  });

  // PRINT OUTPUT
  console.log("\n=================================");
  console.log("GOOGLE REVIEWS");
  console.log("=================================\n");

  reviews.forEach((r, index) => {
    console.log(`Review #${index + 1}`);
    console.log("---------------------------------");
    console.log(`Name    : ${r.name}`);
    console.log(`Rating  : ${r.rating}`);
    console.log(`Date    : ${r.date}`);
    console.log(`Comment : ${r.review}`);
    console.log("\n");
  });

  console.log("=================================");
  console.log(`TOTAL REVIEWS SCRAPED: ${reviews.length}`);
  console.log("=================================\n");

  // SAVE FILE
  fs.writeFileSync(
    "reviews.json",
    JSON.stringify(reviews, null, 2)
  );

  console.log("reviews.json saved successfully.\n");

  await context.close();
}

scrapeReviews();