require("dotenv").config();

const app = require("./src/app");
const { PORT } = require("./src/config/env");

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MemoryAssist AI Server running on port ${PORT}`);
  });
}

module.exports = app;
