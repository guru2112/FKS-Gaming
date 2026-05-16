/**
 * Global Express Error Handler
 * Handles all errors thrown via next(err) or unhandled middleware errors
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // ✅ Log full error in server logs (not sent to client)
  console.error(`❌ Error [${req.method} ${req.originalUrl}]:`, err.message || err);

  // ✅ Handle CORS errors specifically
  if (err.message && err.message.startsWith("CORS policy:")) {
    return res.status(403).json({
      success: false,
      message: err.message,
      code: "CORS_BLOCKED",
    });
  }

  // ✅ Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
      code: "TOKEN_INVALID",
    });
  }

  // ✅ Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors || {})
        .map((e) => e.message)
        .join(", ") || "Validation error",
      code: "VALIDATION_ERROR",
    });
  }

  // ✅ Handle Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists.",
      code: "DUPLICATE_KEY",
    });
  }

  // ✅ Generic error
  const status = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error. Please try again later."
      : err.message || "Server error";

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
