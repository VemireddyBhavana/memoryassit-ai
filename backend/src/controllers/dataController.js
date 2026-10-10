const { randomUUID } = require("node:crypto");
const { query } = require("../db/pool");
const { BANK_ID } = require("../config/env");
const hindsightService = require("../services/hindsightService");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

async function getProfile(req, res, next) {
  try {
    const result = await query(
      "SELECT id, email, display_name, created_at FROM users WHERE id = $1",
      [req.userId],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "User not found." });
    return res.json({ user: result.rows[0] });
  } catch (error) { return next(error); }
}

async function listConversations(req, res, next) {
  try {
    const result = await query(
      `SELECT c.id, c.title, c.customer_id, c.created_at, c.updated_at,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
       FROM conversations c WHERE c.user_id = $1 ORDER BY c.updated_at DESC`,
      [req.userId],
    );
    return res.json({ conversations: result.rows });
  } catch (error) { return next(error); }
}

async function createConversation(req, res, next) {
  const title = typeof req.body?.title === "string" ? req.body.title.trim().slice(0, 120) : "New conversation";
  const customerId = typeof req.body?.customerId === "string" ? req.body.customerId.slice(0, 100) : "cust-nexus-01";
  try {
    const result = await query(
      `INSERT INTO conversations (id, user_id, title, customer_id)
       VALUES ($1, $2, $3, $4) RETURNING id, title, customer_id, created_at, updated_at`,
      [randomUUID(), req.userId, title || "New conversation", customerId],
    );
    return res.status(201).json({ conversation: result.rows[0] });
  } catch (error) { return next(error); }
}

async function getConversation(req, res, next) {
  if (!isUuid(req.params.id)) return res.status(404).json({ error: "Conversation not found." });
  try {
    const conversation = await query(
      "SELECT id, title, customer_id, created_at, updated_at FROM conversations WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId],
    );
    if (!conversation.rows[0]) return res.status(404).json({ error: "Conversation not found." });
    const messages = await query(
      "SELECT id, role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at",
      [req.params.id],
    );
    return res.json({ conversation: conversation.rows[0], messages: messages.rows });
  } catch (error) { return next(error); }
}

async function updateConversation(req, res, next) {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title || title.length > 120) return res.status(400).json({ error: "Title must be between 1 and 120 characters." });
  if (!isUuid(req.params.id)) return res.status(404).json({ error: "Conversation not found." });
  try {
    const result = await query(
      `UPDATE conversations SET title = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 RETURNING id, title, customer_id, created_at, updated_at`,
      [title, req.params.id, req.userId],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Conversation not found." });
    return res.json({ conversation: result.rows[0] });
  } catch (error) { return next(error); }
}

async function deleteConversation(req, res, next) {
  if (!isUuid(req.params.id)) return res.status(404).json({ error: "Conversation not found." });
  try {
    const result = await query("DELETE FROM conversations WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
    if (!result.rowCount) return res.status(404).json({ error: "Conversation not found." });
    return res.json({ success: true });
  } catch (error) { return next(error); }
}

async function updateProfile(req, res, next) {
  const displayName = typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";
  if (displayName.length < 2 || displayName.length > 80) return res.status(400).json({ error: "Name must be between 2 and 80 characters." });
  try {
    const result = await query(
      "UPDATE users SET display_name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, display_name, created_at",
      [displayName, req.userId],
    );
    return res.json({ user: result.rows[0] });
  } catch (error) { return next(error); }
}

async function getSettings(req, res, next) {
  try {
    const result = await query("SELECT theme FROM user_settings WHERE user_id = $1", [req.userId]);
    return res.json({ settings: result.rows[0] || { theme: "dark" } });
  } catch (error) { return next(error); }
}

async function updateSettings(req, res, next) {
  const { theme } = req.body || {};
  if (!["dark", "light"].includes(theme)) return res.status(400).json({ error: "Theme must be dark or light." });
  try {
    const result = await query(
      `INSERT INTO user_settings (user_id, theme, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, updated_at = NOW()
       RETURNING theme`,
      [req.userId, theme],
    );
    return res.json({ settings: result.rows[0] });
  } catch (error) { return next(error); }
}

async function listUserMemories(req, res, next) {
  try {
    const bankId = hindsightService.userBankId(BANK_ID, req.userId);
    const [notes, cloud] = await Promise.all([
      query("SELECT id, content AS text, source, created_at, updated_at FROM user_memories WHERE user_id = $1 ORDER BY updated_at DESC", [req.userId]),
      hindsightService.listMemories(bankId),
    ]);
    return res.json({
      memories: notes.rows,
      hindsight: cloud.items,
      items: [...cloud.items, ...notes.rows],
      hindsightSource: cloud.source,
    });
  } catch (error) { return next(error); }
}

async function createUserMemory(req, res, next) {
  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!content || content.length > 10000) return res.status(400).json({ error: "Memory must be between 1 and 10000 characters." });
  try {
    const result = await query(
      `INSERT INTO user_memories (id, user_id, content) VALUES ($1, $2, $3)
       RETURNING id, content, source, created_at, updated_at`,
      [randomUUID(), req.userId, content],
    );
    return res.status(201).json({ memory: result.rows[0] });
  } catch (error) { return next(error); }
}

async function updateUserMemory(req, res, next) {
  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!content || content.length > 10000) return res.status(400).json({ error: "Memory must be between 1 and 10000 characters." });
  if (!isUuid(req.params.id)) return res.status(404).json({ error: "Memory not found." });
  try {
    const result = await query(
      `UPDATE user_memories SET content = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 RETURNING id, content, source, created_at, updated_at`,
      [content, req.params.id, req.userId],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Memory not found." });
    return res.json({ memory: result.rows[0] });
  } catch (error) { return next(error); }
}

async function deleteUserMemory(req, res, next) {
  if (!isUuid(req.params.id)) return res.status(404).json({ error: "Memory not found." });
  try {
    const result = await query("DELETE FROM user_memories WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
    if (!result.rowCount) return res.status(404).json({ error: "Memory not found." });
    return res.json({ success: true });
  } catch (error) { return next(error); }
}

async function getCloudMemories(req, res, next) {
  try {
    const result = await hindsightService.listMemories(hindsightService.userBankId(BANK_ID, req.userId), req.query.q);
    return res.json({ success: true, items: result.items, source: result.source });
  } catch (error) { return next(error); }
}

async function createReflection(req, res, next) {
  const queryText = typeof req.body?.query === "string" ? req.body.query.trim() : "";
  if (!queryText || queryText.length > 4000) return res.status(400).json({ success: false, error: "Query must be between 1 and 4000 characters." });
  const start = Date.now();
  try {
    const result = await hindsightService.reflect(queryText, hindsightService.userBankId(BANK_ID, req.userId));
    return res.json({ success: true, query: queryText, reflection: result.text || JSON.stringify(result), latencyMs: Date.now() - start, source: "hindsight_reflect" });
  } catch (error) {
    console.error("Reflect failed:", error.message);
    return res.status(502).json({ success: false, error: "Hindsight reflection is temporarily unavailable." });
  }
}

async function resetMemory(req, res, next) {
  try {
    await hindsightService.resetLocalUserMemories(req.userId);
    return res.json({ success: true, message: "User memory cache reset successfully." });
  } catch (error) { return next(error); }
}

module.exports = {
  createConversation,
  createReflection,
  createUserMemory,
  deleteConversation,
  deleteUserMemory,
  getCloudMemories,
  getConversation,
  getProfile,
  getSettings,
  listConversations,
  listUserMemories,
  resetMemory,
  updateConversation,
  updateProfile,
  updateSettings,
  updateUserMemory,
};
