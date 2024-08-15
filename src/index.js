"use strict";

require("dotenv/config");

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const sanitizeMongo = require("express-mongo-sanitize");

require("./utils/db");
require("./utils/passport");

const sanitizeBody = require("./middlewares/sanitizeBody");
const authRouter = require("./routers/auth");
const crapRouter = require("./routers/crap");
const { errorHandler } = require("./utils/errors");
const logger = require("./utils/logger");

const app = express();

app.use(cors("*"));
app.use(express.json());

app.use(sanitizeMongo());
app.use(sanitizeBody);

app.use(
  morgan("tiny", {
    stream: { write: (message) => logger.info(message) },
  })
);
app.get("/", (_req, res) => {
  res.send("Server running @@@@@");
});
app.use("/auth", authRouter);
app.use("/api/crap", crapRouter);

app.get("/login-success", (req, res) => {
  res.send(`Your token is ${req.query.token}`);
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`App running on port ${PORT}`);
});
