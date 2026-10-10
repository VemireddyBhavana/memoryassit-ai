const express = require("express");
const { rateLimit } = require("express-rate-limit");
const {
  currentUser,
  login,
  logout,
  register,
} = require("../controllers/authController");
const { requireAuth, requireDatabase } = require("../middleware/requireAuth");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.use(requireDatabase);
router.post("/signup", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, currentUser);

module.exports = router;
