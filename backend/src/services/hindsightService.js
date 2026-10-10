const { hindsight } = require("../config/clients");
const { BANK_ID, HINDSIGHT_API_KEY } = require("../config/env");
const {
  findRelevantMemories,
  retainLocally,
} = require("./localMemoryService");
const { resetLocalMemories } = require("./localMemoryService");
const { query: dbQuery } = require("../db/pool");

const initializedBanks = new Set();

function userBankId(baseBankId, userId) {
  return `${baseBankId}-${userId.replaceAll("-", "")}`;
}

function isConfigured() {
  return Boolean(hindsight && HINDSIGHT_API_KEY);
}

async function ensureUserBank(userId) {
  if (!isConfigured()) return false;
  const bankId = userBankId(BANK_ID, userId);
  if (initializedBanks.has(bankId)) return true;
  await hindsight.createBank(bankId, { name: "MemoryAssist private memory" });
  initializedBanks.add(bankId);
  return true;
}

async function getVersion() {
  return hindsight.getVersion();
}

async function listMemories(bankId = BANK_ID, search) {
  try {
    if (isConfigured()) {
      const memories = await hindsight.listMemories(bankId, { q: search, limit: 100 });
      if (memories && memories.items) {
        return { items: memories.items, source: "hindsight_cloud" };
      }
    }
  } catch (error) {
    console.warn("Cloud memories fetch error, using local fallback:", error.message);
  }

  return { items: [], source: "local_resilient_cache" };
}

async function recall(customerId, message, bankId = BANK_ID, userId) {
  let recalledItems = [];
  let memoryContext = "";
  let memorySource = "hindsight_cloud";

  try {
    if (isConfigured()) {
      const scopedQuery = `${customerId} ${message}`;
      const response = await hindsight.recall(bankId, scopedQuery);
      const items = Array.isArray(response) ? response : response?.results || [];

      if (items.length > 0) {
        recalledItems = items;
        memoryContext = items
          .map((memory) => memory.text || memory.content)
          .filter(Boolean)
          .join("\n");
      }
    }
  } catch (error) {
    console.warn("Hindsight cloud recall failed, switching to local cache:", error.message);
    memorySource = "local_cache_fallback";
  }

  if (recalledItems.length === 0) {
    const matched = findRelevantMemories(message, userId);
    if (matched.length > 0) {
      recalledItems = matched;
      memoryContext = matched.map((memory) => memory.text).join("\n");
      memorySource = "local_cache_fallback";
    }
  }

  const terms = [...new Set(message.toLowerCase().match(/[a-z0-9]{3,}/g) || [])].slice(0, 8);
  if (terms.length > 0) {
    const values = [userId, ...terms.map((term) => `%${term}%`)];
    const search = terms.map((_, index) => `content ILIKE $${index + 2}`).join(" OR ");
    const stored = await dbQuery(
      `SELECT id, content AS text, source, updated_at
       FROM user_memories WHERE user_id = $1 AND (${search})
       ORDER BY updated_at DESC LIMIT 8`,
      values,
    );
    const storedItems = stored.rows.filter(
      (row) => !recalledItems.some((item) => (item.text || item.content) === row.text),
    );
    recalledItems = [...recalledItems, ...storedItems];
    if (storedItems.length) {
      memoryContext = [memoryContext, ...storedItems.map((item) => item.text)]
        .filter(Boolean)
        .join("\n");
      memorySource = memorySource === "hindsight_cloud"
        ? "hindsight_cloud+postgres"
        : "postgres_local_fallback";
    }
  }

  return { recalledItems, memoryContext, memorySource };
}

function retainInteraction(text, customerId, bankId = BANK_ID, userId) {
  retainLocally({
    id: `mem-${Date.now()}`,
    text,
    entities: [customerId, "Interaction"],
    type: "local_cache",
    date: new Date().toISOString(),
  }, userId);

  if (isConfigured()) {
    hindsight.retain(bankId, text).catch((error) => {
      console.warn("Background Hindsight cloud retain warning:", error.message);
    });
  }
}

async function reflect(query, bankId = BANK_ID) {
  if (!isConfigured()) {
    throw new Error("Hindsight client is not initialized.");
  }
  return hindsight.reflect(bankId, query);
}

async function resetUserLocalMemories(userId) {
  resetLocalMemories(userId);
}

module.exports = {
  getVersion,
  ensureUserBank,
  isConfigured,
  listMemories,
  recall,
  reflect,
  retainInteraction,
  userBankId,
  resetLocalUserMemories: resetUserLocalMemories,
};
