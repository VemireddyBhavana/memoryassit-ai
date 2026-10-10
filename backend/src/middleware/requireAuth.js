const { DATABASE_URL } = require("../config/env");
const { COOKIE_NAME, hashToken } = require("../services/sessionService");
const { query } = require("../db/pool");

function readCookie(header, key) {
  const item = header?.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${key}=`));
  return item ? decodeURIComponent(item.slice(key.length + 1)) : null;
}

async function loadSession(req, res, next) {
  if (!DATABASE_URL) return next();
  try {
    const token = readCookie(req.headers.cookie, COOKIE_NAME);
    if (!token) return next();

    const tokenHash = hashToken(token);
    const result = await query(
      "SELECT user_id FROM user_sessions WHERE token_hash = $1 AND expires_at > NOW()",
      [tokenHash],
    );
    if (result.rows[0]) {
      req.userId = result.rows[0].user_id;
      req.sessionTokenHash = tokenHash;
    }
    next();
  } catch (error) {
    next(error);
  }
}

function requireDatabase(req, res, next) {
  if (!DATABASE_URL) {
    return res.status(503).json({
      error: "Authentication and saved data require PostgreSQL. Configure DATABASE_URL.",
    });
  }
  next();
}

function requireAuth(req, res, next) {
  if (!DATABASE_URL) {
    return res.status(503).json({
      error: "Authentication and saved data require PostgreSQL. Configure DATABASE_URL.",
    });
  }
  if (!req.userId) {
    return res.status(401).json({ error: "Please log in to continue." });
  }
  next();
}

module.exports = { loadSession, requireAuth, requireDatabase };
