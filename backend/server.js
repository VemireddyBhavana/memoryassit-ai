require("dotenv").config();

const app = require("./src/app");
const { DATABASE_URL, NODE_ENV, PORT, SESSION_SECRET } = require("./src/config/env");
const { initializeDatabase } = require("./src/db/pool");

if (!DATABASE_URL) {
  console.warn("DATABASE_URL is not configured; account features are unavailable.");
}

async function startServer() {
  if (NODE_ENV === "production" && (!DATABASE_URL || !SESSION_SECRET)) {
    throw new Error("Production startup requires DATABASE_URL and SESSION_SECRET.");
  }
  if (DATABASE_URL) await initializeDatabase();
  return app.listen(PORT, () => {
    console.log(`MemoryAssist AI Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Backend startup failed:", error);
    process.exitCode = 1;
  });
}

app.startServer = startServer;
module.exports = app;
