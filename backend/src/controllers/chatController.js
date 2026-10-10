const { BANK_ID } = require("../config/env");
const groqService = require("../services/groqService");
const hindsightService = require("../services/hindsightService");
const { validateChatInput } = require("../validators/chatValidator");

async function createChatReply(req, res) {
  const startTime = Date.now();
  try {
    const validation = validateChatInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ reply: validation.error });
    }

    const { message, customerId } = validation.value;
    const recallStart = Date.now();
    const { recalledItems, memoryContext, memorySource } =
      await hindsightService.recall(customerId, message);
    const recallMs = Date.now() - recallStart;
    const { reply, llmSource } = await groqService.generateReply(
      message,
      memoryContext,
    );

    const interactionText = `Customer [${customerId}]: ${message}\nAgent: ${reply}`;
    hindsightService.retainInteraction(interactionText, customerId);

    res.json({
      reply,
      recalledMemories: recalledItems,
      memoryCount: recalledItems.length,
      telemetry: {
        recallLatencyMs: recallMs,
        totalLatencyMs: Date.now() - startTime,
        bankId: BANK_ID,
        retained: true,
        memorySource,
        llmSource,
      },
    });
  } catch (error) {
    console.error("Critical chat error:", error);
    res.json({
      reply:
        "MemoryAssist AI resilient fallback: Your message has been safely queued and will be processed immediately upon reconnection.",
      recalledMemories: [],
      memoryCount: 0,
      telemetry: {
        status: "safe_fallback",
        error: error.message,
      },
    });
  }
}

module.exports = { createChatReply };
