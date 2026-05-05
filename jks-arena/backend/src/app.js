const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");
const mediaRoutes = require("./routes/media");

const { errorHandler } = require("./middleware/errorHandler");

const app = express();

/* ================== CORS ================== */
const originEnv = process.env.CLIENT_ORIGIN || "";
const allowedOrigins = originEnv
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);

/* ================== BODY PARSER ================== */
// 🔥 IMPORTANT: increase limit for image upload (base64)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================== STATIC ================== */
app.use(
  "/photos",
  express.static(path.resolve(__dirname, "..", "..", "photos"))
);

/* ================== HEALTH CHECK ================== */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================== ROUTES ================== */
app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/admin", adminRoutes);

// 🔥 MEDIA ROUTES (UPLOAD / GET / DELETE)
app.use("/api/media", mediaRoutes);

/* ================== ERROR HANDLER ================== */
app.use(errorHandler);

module.exports = app;