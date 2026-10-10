const { GROQ_API_KEY, GROQ_MODEL, BANK_ID } = require("../config/env");
const hindsightService = require("../services/hindsightService");

async function getHealth(req, res) {
  let hindsightStatus = { connected: false, version: "fallback", bankId: BANK_ID };
  const groqStatus = { connected: Boolean(GROQ_API_KEY), model: GROQ_MODEL };

  try {
    if (hindsightService.isConfigured()) {
      const version = await hindsightService.getVersion();
      hindsightStatus = {
        connected: true,
        version: version.api_version,
        bankId: BANK_ID,
        features: version.features,
      };
    }
  } catch (error) {
    hindsightStatus.error = error.message;
    hindsightStatus.fallbackMode = true;
  }

  res.json({
    status:
      hindsightStatus.connected && groqStatus.connected
        ? "healthy"
        : "resilient_fallback",
    hindsight: hindsightStatus,
    groq: groqStatus,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { getHealth };
