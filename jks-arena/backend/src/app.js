const express = require("express");
const cors = require("cors");
const path = require("path");

/* =========================================================
   🔥 ROUTES
========================================================= */

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");
const mediaRoutes = require("./routes/media");
const notificationRoutes = require("./routes/notifications");
const pushRoutes = require("./routes/push");
const userRoutes = require("./routes/user");
const reviewRoutes = require("./routes/reviews");

const { errorHandler } = require("./middleware/errorHandler");

const app = express();

/* =========================================================
   🔥 CORS CONFIGURATION
   Production-grade: reads allowed origins from env
========================================================= */

// ✅ Build allowed origins list from environment + hardcoded safe defaults
const allowedOrigins = (() => {
  const origins = new Set([
    // Always allow local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    // Production Vercel frontend
    "https://fks-gaming.vercel.app",
  ]);

  // Support additional origins via env (comma-separated)
  const envOrigin = process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL;
  if (envOrigin) {
    envOrigin.split(",").forEach((o) => origins.add(o.trim()));
  }

  return [...origins];
})();

console.log("✅ Allowed CORS Origins:", allowedOrigins);

// ✅ CORS options object (reused for main middleware + preflight)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no Origin header
    // (Postman, server-to-server, mobile native apps)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked: ${origin}`);
      callback(new Error(`CORS policy: origin '${origin}' is not allowed.`));
    }
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
    "Expires",
  ],

  exposedHeaders: ["Content-Length", "Content-Type"],

  // Cache preflight for 24 hours
  maxAge: 86400,
};

// ✅ Apply CORS middleware globally
app.use(cors(corsOptions));

// ✅ Handle ALL OPTIONS preflight requests globally (must be before all routes)
app.options("*", cors(corsOptions));

/* =========================================================
   🔥 BODY PARSER
========================================================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================================================
   🔥 STATIC FILES
========================================================= */

// Serve uploaded images
app.use(
  "/photos",
  express.static(path.resolve(__dirname, "..", "..", "photos"))
);

// Serve upload folder
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"))
);

/* =========================================================
   🔥 REQUEST LOGGER
========================================================= */

app.use((req, res, next) => {
  console.log(`📌 ${req.method} ${req.originalUrl} — Origin: ${req.headers.origin || "none"}`);
  next();
});

/* =========================================================
   🔥 HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "Backend is running successfully 🚀",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
  });
});

/* =========================================================
   🔥 ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JKS Arena Backend is running 🚀",
  });
});

/* =========================================================
   🔥 API ROUTES
========================================================= */

// Auth (register, login, google, forgot-password, etc.)
app.use("/api/auth", authRoutes);

// Dashboard (bookings, notifications, etc.)
app.use("/api", dashboardRoutes);

// User profile
app.use("/api/user", userRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Media (Cloudinary)
app.use("/api/media", mediaRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Push notifications
app.use("/api/push", pushRoutes);

// Reviews
app.use("/api/reviews", reviewRoutes);

/* =========================================================
   🔥 TEST ROUTE (remove in production if not needed)
========================================================= */

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API working correctly ✅" });
});

/* =========================================================
   🔥 404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found ❌",
    path: req.originalUrl,
  });
});

/* =========================================================
   🔥 GLOBAL ERROR HANDLER
========================================================= */

app.use(errorHandler);

/* =========================================================
   🔥 EXPORT APP
========================================================= */

module.exports = app;