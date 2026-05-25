const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");

async function test() {
  await mongoose.connect("mongodb+srv://adityagsolaskar21:mOckp455w0rd!@cluster0.abcde.mongodb.net/jks-arena?retryWrites=true&w=majority");
  
  // Or just mock a token since we have JWT_SECRET in .env
  const dotenv = require("dotenv");
  dotenv.config({ path: "../.env" });
  
  const token = jwt.sign({ id: "123", role: "admin" }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
  
  try {
    const res = await axios.post("http://localhost:5000/api/admin/notifications/send", {
      targetType: "all",
      title: "Test",
      message: "Test"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.status + " " + err.response.statusText : err.message);
  }
  process.exit(0);
}
test();
