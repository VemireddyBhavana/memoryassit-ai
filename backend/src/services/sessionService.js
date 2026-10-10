const { createHmac, randomBytes } = require("node:crypto");
const { COOKIE_SECURE, SESSION_SECRET } = require("../config/env");
const { query } = require("../db/pool");

const COOKIE_NAME = "memoryassist.sid";
const SESSION_DAYS = 7;

function hashToken(token) {
  return createHmac("sha256", SESSION_SECRET || "memoryassist-local-session-key")
    .update(token)
    .digest("hex");
}

async function issueSession(userId, res) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await query(
    "INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [tokenHash, userId, expiresAt],
  );
  const secure = COOKIE_SECURE ? "; Secure" : "";
  const sameSite = COOKIE_SECURE ? "None" : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=${SESSION_DAYS * 86400}${secure}`,
  );
}

async function revokeSession(tokenHash) {
  if (tokenHash) await query("DELETE FROM user_sessions WHERE token_hash = $1", [tokenHash]);
}

function clearSessionCookie(res) {
  const secure = COOKIE_SECURE ? "; Secure" : "";
  const sameSite = COOKIE_SECURE ? "None" : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${secure}`,
  );
}

module.exports = { COOKIE_NAME, clearSessionCookie, hashToken, issueSession, revokeSession };
