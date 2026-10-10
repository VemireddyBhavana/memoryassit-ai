const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { loadSession, requireAuth } = require("./middleware/requireAuth");
const { CLIENT_ORIGIN } = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({
  origin: CLIENT_ORIGIN.split(",").map((origin) => origin.trim()),
  credentials: true,
}));
app.use(express.json());
app.use(loadSession);
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", requireAuth, dataRoutes);
app.use("/", requireAuth, chatRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
