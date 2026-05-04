const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../src/models/Admin");

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

async function run() {
  const name = process.env.ADMIN_NAME || process.argv[2];
  const email = process.env.ADMIN_EMAIL || process.argv[3];
  const password = process.env.ADMIN_PASSWORD || process.argv[4];

  if (!name || !email || !password) {
    console.error(
      "Missing arguments. Usage: node scripts/create-admin.js \"Name\" email@example.com Password123"
    );
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in the root .env file.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await Admin.findOne({ email: normalizedEmail });

  if (existing) {
    console.error("Admin already exists with this email.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    isActive: true,
  });

  console.log("Admin created:", admin._id.toString());
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
