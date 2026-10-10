const PORT = Number(process.env.PORT) || 5000;
const BANK_ID = process.env.HINDSIGHT_BANK_ID || "MemoryAssist-AI";
const HINDSIGHT_BASE_URL =
  process.env.HINDSIGHT_BASE_URL || "https://api.hindsight.vectorize.io";
const GROQ_MODEL = "openai/gpt-oss-120b";
const DATABASE_URL = process.env.DATABASE_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ||
  "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173";
const NODE_ENV = process.env.NODE_ENV || "development";
const COOKIE_SECURE = NODE_ENV === "production";

module.exports = {
  PORT,
  BANK_ID,
  HINDSIGHT_BASE_URL,
  GROQ_MODEL,
  DATABASE_URL,
  SESSION_SECRET,
  CLIENT_ORIGIN,
  NODE_ENV,
  COOKIE_SECURE,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  HINDSIGHT_API_KEY: process.env.HINDSIGHT_API_KEY,
};
