const Groq = require("groq-sdk");
const { HindsightClient } = require("@vectorize-io/hindsight-client");
const { GROQ_API_KEY, HINDSIGHT_API_KEY, HINDSIGHT_BASE_URL } = require("./env");

const groq = new Groq({
  apiKey: GROQ_API_KEY || "missing_key",
});

let hindsight = null;
try {
  hindsight = new HindsightClient({
    baseUrl: HINDSIGHT_BASE_URL,
    apiKey: HINDSIGHT_API_KEY || "missing_key",
  });
} catch (error) {
  console.warn("Hindsight Client init warning:", error.message);
}

module.exports = { groq, hindsight };
