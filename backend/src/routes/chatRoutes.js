const express = require("express");
const { createChatReply } = require("../controllers/chatController");

const router = express.Router();

router.post("/chat", createChatReply);

module.exports = router;
