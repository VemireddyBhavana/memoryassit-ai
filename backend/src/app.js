const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);
app.use("/", chatRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
