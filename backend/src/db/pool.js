const { Pool } = require("pg");
const { DATABASE_URL } = require("../config/env");

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    })
  : null;

async function query(text, values) {
  if (!pool) {
    const error = new Error("PostgreSQL is not configured. Set DATABASE_URL.");
    error.status = 503;
    throw error;
  }
  return pool.query(text, values);
}

async function initializeDatabase() {
  if (!pool) return false;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'New conversation',
      customer_id TEXT NOT NULL DEFAULT 'cust-nexus-01',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS conversations_user_updated_idx
      ON conversations (user_id, updated_at DESC);

    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY,
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
      ON messages (conversation_id, created_at);

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS user_sessions_expires_idx ON user_sessions (expires_at);

    CREATE TABLE IF NOT EXISTS user_memories (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS user_memories_user_updated_idx
      ON user_memories (user_id, updated_at DESC);
  `);
  await pool.query("DELETE FROM user_sessions WHERE expires_at < NOW()");
  return true;
}

async function closeDatabase() {
  if (pool) await pool.end();
}

module.exports = { closeDatabase, initializeDatabase, pool, query };
