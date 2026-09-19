const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    return res.status(401).json({ error: "Authentication token is required." });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch (_) {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}

function authOptional(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    };
  } catch (_) {
    // Silently proceed if optional token is invalid or expired
  }
  return next();
}

module.exports = {
  authRequired,
  authOptional
};
