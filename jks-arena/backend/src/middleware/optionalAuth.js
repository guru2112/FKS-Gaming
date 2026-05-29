// backend/src/middleware/optionalAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  req.userId = null;
  req.userRole = "guest";

  if (!token) {
    return next();
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next();
  }

  try {
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    req.userRole = payload.role || "user";
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }
  
  next();
}

module.exports = { optionalAuth };
