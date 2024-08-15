const jwt = require("jsonwebtoken");

const generateToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1 day",
  });

const verifyToken = (token) => {
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  return verified;
};

module.exports = {
  generateToken,
  verifyToken,
};
