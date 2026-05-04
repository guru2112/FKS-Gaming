const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token." });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET is not set in the environment." });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    req.userRole = payload.role || "user";
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  return authenticate(req, res, () => {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    return next();
  });
}

module.exports = {
  authenticate,
  requireAdmin,
};
