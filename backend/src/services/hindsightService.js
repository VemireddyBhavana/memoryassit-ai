const { hindsight } = require("../config/clients");
const { BANK_ID, HINDSIGHT_API_KEY } = require("../config/env");
const {
  findRelevantMemories,
  listLocalMemories,
  retainLocally,
} = require("./localMemoryService");

function isConfigured() {
  return Boolean(hindsight && HINDSIGHT_API_KEY);
}

async function getVersion() {
  return hindsight.getVersion();
}

async function listMemories() {
  try {
    if (isConfigured()) {
      const memories = await hindsight.listMemories(BANK_ID);
      if (memories && memories.items) {
        return { items: memories.items, source: "hindsight_cloud" };
      }
    }
  } catch (error) {
    console.warn("Cloud memories fetch error, using local fallback:", error.message);
  }

  return { items: listLocalMemories(), source: "local_resilient_cache" };
}

async function recall(customerId, message) {
  let recalledItems = [];
  let memoryContext = "";
  let memorySource = "hindsight_cloud";

  try {
    if (isConfigured()) {
      const scopedQuery = `${customerId} ${message}`;
      const response = await hindsight.recall(BANK_ID, scopedQuery);
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
    const matched = findRelevantMemories(message);
    if (matched.length > 0) {
      recalledItems = matched;
      memoryContext = matched.map((memory) => memory.text).join("\n");
      memorySource = "local_cache_fallback";
    }
  }

  return { recalledItems, memoryContext, memorySource };
}

function retainInteraction(text, customerId) {
  retainLocally({
    id: `mem-${Date.now()}`,
    text,
    entities: [customerId, "Interaction"],
    type: "local_cache",
    date: new Date().toISOString(),
  });

  if (isConfigured()) {
    hindsight.retain(BANK_ID, text).catch((error) => {
      console.warn("Background Hindsight cloud retain warning:", error.message);
    });
  }
}

async function reflect(query) {
  if (!isConfigured()) {
    throw new Error("Hindsight client is not initialized.");
  }
  return hindsight.reflect(BANK_ID, query);
}

module.exports = {
  getVersion,
  isConfigured,
  listMemories,
  recall,
  reflect,
  retainInteraction,
};
