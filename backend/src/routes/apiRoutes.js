const express = require("express");
const { getHealth } = require("../controllers/healthController");
const {
  listMemories,
  resetMemories,
} = require("../controllers/memoryController");
const { createReflection } = require("../controllers/reflectController");

const router = express.Router();

router.get("/health", getHealth);
router.get("/memories", listMemories);
router.post("/reflect", createReflection);
router.post("/reset", resetMemories);

module.exports = router;
