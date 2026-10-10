const { BANK_ID } = require("../config/env");
const groqService = require("../services/groqService");
const hindsightService = require("../services/hindsightService");
const { validateChatInput } = require("../validators/chatValidator");
const { query, pool } = require("../db/pool");
const { randomUUID } = require("node:crypto");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function createChatReply(req, res) {
  const startTime = Date.now();
  try {
    const validation = validateChatInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ reply: validation.error });
    }

    const { message, customerId } = validation.value;
    const conversationId = req.params.id || req.body.conversationId;
    if (typeof conversationId !== "string" || !UUID_PATTERN.test(conversationId)) {
      return res.status(400).json({ reply: "Conversation ID is required." });
    }
    const conversation = await query(
      "SELECT id, title FROM conversations WHERE id = $1 AND user_id = $2",
      [conversationId, req.userId],
    );
    if (!conversation.rows[0]) {
      return res.status(404).json({ reply: "Conversation not found." });
    }
    const bankId = hindsightService.userBankId(BANK_ID, req.userId);
    try {
      await hindsightService.ensureUserBank(req.userId);
    } catch (error) {
      console.warn("Hindsight bank is unavailable; continuing with the local memory fallback:", error.message);
    }
    const recallStart = Date.now();
    const { recalledItems, memoryContext, memorySource } =
      await hindsightService.recall(customerId, message, bankId, req.userId);
    const recallMs = Date.now() - recallStart;
    const { reply, llmSource } = await groqService.generateReply(
      message,
      memoryContext,
    );

    const interactionText = `Customer [${customerId}]: ${message}\nAgent: ${reply}`;
    const dbClient = await pool.connect();
    try {
      await dbClient.query("BEGIN");
      await dbClient.query(
        "INSERT INTO messages (id, conversation_id, role, content) VALUES ($1, $2, 'user', $3), ($4, $2, 'assistant', $5)",
        [randomUUID(), conversationId, message, randomUUID(), reply],
      );
      await dbClient.query(
        `UPDATE conversations SET
          title = CASE WHEN title = 'New conversation' THEN LEFT($1, 60) ELSE title END,
          updated_at = NOW()
         WHERE id = $2 AND user_id = $3`,
        [message, conversationId, req.userId],
      );
      await dbClient.query(
        "INSERT INTO user_memories (id, user_id, content, source) VALUES ($1, $2, $3, 'chat')",
        [randomUUID(), req.userId, interactionText],
      );
      await dbClient.query("COMMIT");
    } catch (error) {
      await dbClient.query("ROLLBACK");
      throw error;
    } finally {
      dbClient.release();
    }
    hindsightService.retainInteraction(interactionText, customerId, bankId, req.userId);

    res.json({
      reply,
      recalledMemories: recalledItems,
      memoryCount: recalledItems.length,
      telemetry: {
        recallLatencyMs: recallMs,
        totalLatencyMs: Date.now() - startTime,
        bankId,
        retained: true,
        memorySource,
        llmSource,
      },
    });
  } catch (error) {
    console.error("Critical chat error:", error);
    return res.status(500).json({ error: "Unable to process or save this message. Please try again." });
  }
}

module.exports = { createChatReply };
