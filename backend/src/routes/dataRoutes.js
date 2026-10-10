const express = require("express");
const controller = require("../controllers/dataController");
const { createChatReply } = require("../controllers/chatController");
const { requireDatabase } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireDatabase);
router.get("/conversations", controller.listConversations);
router.post("/conversations", controller.createConversation);
router.post("/conversations/:id/messages", createChatReply);
router.get("/conversations/:id", controller.getConversation);
router.patch("/conversations/:id", controller.updateConversation);
router.delete("/conversations/:id", controller.deleteConversation);
router.get("/profile", controller.getProfile);
router.patch("/profile", controller.updateProfile);
router.get("/settings", controller.getSettings);
router.patch("/settings", controller.updateSettings);
router.get("/memories", controller.listUserMemories);
router.post("/memories", controller.createUserMemory);
router.patch("/memories/:id", controller.updateUserMemory);
router.delete("/memories/:id", controller.deleteUserMemory);
router.get("/hindsight/memories", controller.getCloudMemories);
router.post("/reflect", controller.createReflection);
router.post("/reset", controller.resetMemory);

module.exports = router;
