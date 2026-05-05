const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");
const mediaRoutes = require("./routes/media");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

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
app.use(express.json());
app.use(
  "/photos",
  express.static(path.resolve(__dirname, "..", "..", "photos"))
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/media", mediaRoutes);

app.use(errorHandler);

module.exports = app;
