const path = require("path");
const dotenv = require("dotenv");
const app = require("./app");
const { connectDb } = require("./db");

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
