const { Router } = require("express");
const passport = require("passport");
const { generateToken } = require("../services/tokenService");

const authRouter = Router();

authRouter.get("/login", (_, res) => {
  res.send("login page");
});
authRouter.get("/google", (req, res, next) => {
  const { redirect_url } = req.query;

  const state = redirect_url
    ? Buffer.from(JSON.stringify({ redirect_url })).toString("base64")
    : undefined;

  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    session: false,
    scope: ["profile"],
    state,
  })(req, res, next);
});

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    session: false,
    scope: ["profile"],
  }),
  (req, res) => {
    const { state } = req.query;

    const { redirect_url } = state
      ? JSON.parse(Buffer.from(state, "base64").toString())
      : {};

    const baseUrl = redirect_url ?? "/login-success";
    ``;

    const token = generateToken(req.user);
    res.redirect(`${baseUrl}?token=${token}`);
  }
);

module.exports = authRouter;
