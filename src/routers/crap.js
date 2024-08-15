const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const crapController = require("../controllers/crap");
const { validateCrap } = require("../middlewares/validateCrap");

const sanitizeBody = require("../middlewares/sanitizeBody");
const attachImages = require("../middlewares/attachImages");
const isValidObjectId = require("../middlewares/isValidObjectId");

const router = express.Router();
router.post(
  "/",
  isAuthenticated,
  attachImages,
  sanitizeBody,
  crapController.createCrap
);
router.get("/", isAuthenticated, crapController.getAllCrap);
router.get("/mine", isAuthenticated, crapController.getMyCrap);
router.get("/:id", isAuthenticated, crapController.getCrapById);

router.put(
  "/:id",
  isAuthenticated,
  attachImages,
  sanitizeBody,
  isValidObjectId,
  validateCrap,
  crapController.updateCrap
);
router.patch(
  "/:id",
  isAuthenticated,
  attachImages,
  sanitizeBody,
  isValidObjectId,
  crapController.updateCrap
);
router.delete(
  "/:id",
  isAuthenticated,
  isValidObjectId,
  crapController.deleteCrap
);
router.post(
  "/:id/interested",
  isAuthenticated,
  isValidObjectId,
  sanitizeBody,
  crapController.interestedOn
);
router.post(
  "/:id/suggest",
  isAuthenticated,
  isValidObjectId,
  sanitizeBody,
  crapController.suggestTime
);
router.post(
  "/:id/agree",
  isAuthenticated,
  sanitizeBody,
  crapController.agreeToCrap
);
router.post(
  "/:id/disagree",
  isAuthenticated,
  sanitizeBody,
  crapController.disagreeToCrap
);
router.post(
  "/:id/reset",
  isAuthenticated,
  sanitizeBody,
  crapController.resetCrap
);
router.post(
  "/:id/flush",
  isAuthenticated,
  sanitizeBody,
  crapController.flushCrap
);

module.exports = router;
