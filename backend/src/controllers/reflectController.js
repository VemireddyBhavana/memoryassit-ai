const { BANK_ID } = require("../config/env");
const hindsightService = require("../services/hindsightService");
const { validateReflectInput } = require("../validators/reflectValidator");

async function createReflection(req, res) {
  const startTime = Date.now();
  const validation = validateReflectInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
      reflection: "Unable to generate reflection. Please provide a valid query.",
    });
  }

  try {
    const result = await hindsightService.reflect(validation.value.query);
    return res.json({
      success: true,
      bankId: BANK_ID,
      query: validation.value.query,
      reflection: result.text || JSON.stringify(result),
      latencyMs: Date.now() - startTime,
      source: "hindsight_reflect",
    });
  } catch (error) {
    console.error("Reflect failed:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      reflection:
        "Unable to generate reflection at this time. Please check your Hindsight Cloud connection.",
    });
  }
}

module.exports = { createReflection };
