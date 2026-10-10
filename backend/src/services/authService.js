const bcrypt = require("bcryptjs");
const { randomUUID } = require("node:crypto");
const { query } = require("../db/pool");

async function createUser({ email, password, displayName }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const id = randomUUID();
  const result = await query(
    `INSERT INTO users (id, email, password_hash, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, display_name, created_at`,
    [id, email.toLowerCase(), passwordHash, displayName.trim()],
  );
  await query("INSERT INTO user_settings (user_id) VALUES ($1)", [id]);
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await query(
    "SELECT id, email, password_hash, display_name, created_at FROM users WHERE email = $1",
    [email.toLowerCase()],
  );
  return result.rows[0] || null;
}

async function getPublicUser(id) {
  const result = await query(
    "SELECT id, email, display_name, created_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
}

module.exports = { createUser, findUserByEmail, getPublicUser };
