const express = require("express");

const cors = require("cors");

const path = require("path");

// =========================================================
// 🔥 ROUTES
// =========================================================

const authRoutes =
  require("./routes/auth");

const dashboardRoutes =
  require("./routes/dashboard");

const adminRoutes =
  require("./routes/admin");

const mediaRoutes =
  require("./routes/media");

// 🔥 NOTIFICATION ROUTES
const notificationRoutes =
  require("./routes/notifications");

// 🔥 PUSH ROUTES
const pushRoutes =
  require("./routes/push");

const {
  errorHandler,
} = require("./middleware/errorHandler");

const app = express();

/* =========================================================
   🔥 CORS
========================================================= */

const originEnv =
  process.env.CLIENT_ORIGIN || "";

const allowedOrigins =
  originEnv
    .split(",")
    .map((origin) =>
      origin.trim()
    )
    .filter(Boolean);

app.use(
  cors({

    origin:
      allowedOrigins.length > 0
        ? allowedOrigins
        : true,

    credentials:
      true,

  })
);

/* =========================================================
   🔥 BODY PARSER
========================================================= */

// 🔥 IMPORTANT:
// Increase limit for base64 uploads

app.use(
  express.json({
    limit:
      "10mb",
  })
);

app.use(
  express.urlencoded({

    extended:
      true,

    limit:
      "10mb",

  })
);

/* =========================================================
   🔥 STATIC FILES
========================================================= */

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

app.get(
  "/api/health",

  (req, res) => {

    res.json({
      status:
        "ok",
    });

  }
);

/* =========================================================
   🔥 ROUTES
========================================================= */

// =========================================================
// 🔥 AUTH
// =========================================================

app.use(
  "/api/auth",
  authRoutes
);

// =========================================================
// 🔥 DASHBOARD
// =========================================================

app.use(
  "/api",
  dashboardRoutes
);

// =========================================================
// 🔥 ADMIN
// =========================================================

app.use(
  "/api/admin",
  adminRoutes
);

// =========================================================
// 🔥 MEDIA
// =========================================================

app.use(
  "/api/media",
  mediaRoutes
);

// =========================================================
// 🔥 NOTIFICATIONS
// =========================================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// =========================================================
// 🔥 PUSH NOTIFICATIONS
// =========================================================

app.use(
  "/api/push",
  pushRoutes
);

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});
/* =========================================================
   🔥 ERROR HANDLER
========================================================= */

app.use(
  errorHandler
);

module.exports =
  app;