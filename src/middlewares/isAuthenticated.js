const passport = require("passport");
const { UnauthorizedError } = require("../utils/errors");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Token is missing or invalid"));
  }
  if (req.method === "GET") {
    passport.authenticate("bearer", {
      session: false,
      failureRedirect: "/auth/login",
      failWithError: true,
    })(req, res, next);
  } else {
    passport.authenticate("bearer", {
      session: false,
      failWithError: true,
    })(req, res, (e) => {
      if (e) {
        return next(new UnauthorizedError("Unauthenticated"));
      }
      next();
    });
  }
};

module.exports = isAuthenticated;
