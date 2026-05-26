const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET is not set." });
  }

  try {
    const payload = jwt.verify(token, secret);
    
    // Revocation check via tokenVersion
    const role = payload.role || "user";
    const payloadVersion = payload.tokenVersion || 0;
    let dbVersion = 0;
    
    if (role === "admin") {
      const admin = await Admin.findById(payload.sub).select("tokenVersion isActive");
      if (!admin || !admin.isActive) throw new Error("Admin not found or disabled");
      dbVersion = admin.tokenVersion || 0;
    } else {
      const user = await User.findById(payload.sub).select("tokenVersion");
      if (!user) throw new Error("User not found");
      dbVersion = user.tokenVersion || 0;
    }
    
    if (payloadVersion !== dbVersion) {
      throw new Error("Token revoked");
    }

    req.userId = payload.sub;
    req.userRole = role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }
    next();
  });
}

module.exports = { authenticate, requireAdmin };