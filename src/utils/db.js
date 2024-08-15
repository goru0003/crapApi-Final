const mongoose = require("mongoose");
const logger = require("./logger");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    logger.info("Connected to mongoose");
  })
  .catch((err) => {
    logger.error("Error connecting to mongoose", err);
  });
