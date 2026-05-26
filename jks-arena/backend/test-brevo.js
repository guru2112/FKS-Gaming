const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function run() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log("No API Key found in .env");
    return;
  }
  
  console.log("Testing Key:", apiKey.substring(0, 15) + "...");
  
  try {
    const response = await fetch("https://api.brevo.com/v3/account", {
      method: "GET",
      headers: {
        "api-key": apiKey,
      },
    });
    
    const errText = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", errText);
  } catch (err) {
    console.error(err);
  }
}

run();
