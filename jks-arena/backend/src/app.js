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

// 🔥 NOTIFICATION ROUTES
const notificationRoutes = require("./routes/notifications");

// 🔥 PUSH ROUTES
const pushRoutes = require("./routes/push");

const {
  errorHandler,
} = require("./middleware/errorHandler");

const app = express();

/* =========================================================
   🔥 CORS CONFIGURATION
========================================================= */

// ✅ Allowed Frontend Origins

const allowedOrigins = [
  "http://localhost:3000",
  "https://fks-gaming.vercel.app",
];

// ✅ CORS Middleware

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // like mobile apps or Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(
            "CORS policy blocked this origin"
          )
        );
      }
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

/* =========================================================
   🔥 BODY PARSER
========================================================= */

// ✅ Increase payload limit for uploads

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =========================================================
   🔥 STATIC FILES
========================================================= */

// ✅ Serve uploaded photos

app.use(
  "/photos",
  express.static(
    path.resolve(
      __dirname,
      "..",
      "..",
      "photos"
    )
  )
);

/* =========================================================
   🔥 HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message:
      "Backend is running successfully 🚀",
  });
});

/* =========================================================
   🔥 ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.send(
    "JKS Arena Backend is running successfully 🚀"
  );
});

/* =========================================================
   🔥 API ROUTES
========================================================= */

// 🔥 AUTH ROUTES
app.use("/api/auth", authRoutes);

// 🔥 DASHBOARD ROUTES
app.use("/api", dashboardRoutes);

// 🔥 ADMIN ROUTES
app.use("/api/admin", adminRoutes);

// 🔥 MEDIA ROUTES
app.use("/api/media", mediaRoutes);

// 🔥 NOTIFICATION ROUTES
app.use(
  "/api/notifications",
  notificationRoutes
);

// 🔥 PUSH ROUTES
app.use("/api/push", pushRoutes);

/* =========================================================
   🔥 404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
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