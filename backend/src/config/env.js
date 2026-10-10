const PORT = Number(process.env.PORT) || 5000;
const BANK_ID = process.env.HINDSIGHT_BANK_ID || "MemoryAssist-AI";
const HINDSIGHT_BASE_URL =
  process.env.HINDSIGHT_BASE_URL || "https://api.hindsight.vectorize.io";
const GROQ_MODEL = "openai/gpt-oss-120b";

module.exports = {
  PORT,
  BANK_ID,
  HINDSIGHT_BASE_URL,
  GROQ_MODEL,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  HINDSIGHT_API_KEY: process.env.HINDSIGHT_API_KEY,
};
