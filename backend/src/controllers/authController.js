const bcrypt = require("bcryptjs");
const authService = require("../services/authService");
const { clearSessionCookie, issueSession, revokeSession } = require("../services/sessionService");
const { validateCredentials } = require("../validators/authValidator");
const hindsightService = require("../services/hindsightService");

async function register(req, res, next) {
  const validation = validateCredentials(req.body, true);
  if (!validation.valid) return res.status(400).json({ error: validation.error });
  try {
    const existing = await authService.findUserByEmail(validation.value.email);
    if (existing) return res.status(409).json({ error: "An account with this email already exists." });
    const user = await authService.createUser(validation.value);
    try {
      await hindsightService.ensureUserBank(user.id);
    } catch (error) {
      console.warn("Could not initialize the user's Hindsight bank:", error.message);
    }
    await issueSession(user.id, res);
    return res.status(201).json({ user });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "An account with this email already exists." });
    return next(error);
  }
}

async function login(req, res, next) {
  const validation = validateCredentials(req.body);
  if (!validation.valid) return res.status(400).json({ error: validation.error });
  try {
    const user = await authService.findUserByEmail(validation.value.email);
    if (!user || !(await bcrypt.compare(validation.value.password, user.password_hash))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }
    await issueSession(user.id, res);
    const publicUser = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      created_at: user.created_at,
    };
    return res.json({ user: publicUser });
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    await revokeSession(req.sessionTokenHash);
    clearSessionCookie(res);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

async function currentUser(req, res, next) {
  try {
    const user = await authService.getPublicUser(req.userId);
    if (!user) return res.status(401).json({ error: "Your account is no longer available." });
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

module.exports = { currentUser, login, logout, register };
