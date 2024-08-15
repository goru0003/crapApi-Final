const xss = require("xss");

const sanitize = (value) => {
  if (Array.isArray(value)) {
    return value.map((v) => sanitize(v));
  }
  if (value instanceof Object) {
    return stripTags(value);
  }
  if (typeof value === "string") {
    return xss(value, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ["script"],
    });
  }
  return value;
};

const stripTags = (payload) => {
  const attributes = { ...payload };
  for (const key in attributes) {
    attributes[key] = sanitize(attributes[key]);
  }
  return attributes;
};

const sanitizeBody = (req, _res, next) => {
  const { id, _id, ...attributes } = req.body;

  req.sanitizedBody = stripTags(attributes);
  next();
};

module.exports = sanitizeBody;
