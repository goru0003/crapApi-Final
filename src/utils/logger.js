const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format:
    process.env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.simple()
        ),
  defaultMeta: { service: "crap-service" },
  transports: [
    // Production environment: log to files
    ...(process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: "error.log",
            level: "error",
          }),
          new winston.transports.File({ filename: "combined.log" }),
        ]
      : []),
    // Development environment: log to console
    new winston.transports.Console(),
  ],
});

module.exports = logger;
