const { BANK_ID } = require("../config/env");
const hindsightService = require("../services/hindsightService");
const { resetLocalMemories } = require("../services/localMemoryService");

async function listMemories(req, res) {
  const result = await hindsightService.listMemories();
  res.json({
    success: true,
    bankId: BANK_ID,
    items: result.items,
    source: result.source,
  });
}

async function resetMemories(req, res) {
  resetLocalMemories();
  res.json({ success: true, message: "Session cache reset successfully." });
}

module.exports = { listMemories, resetMemories };
