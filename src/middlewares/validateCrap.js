const imageLoad = require("../services/images");
const sanitizeBody = require("./sanitizeBody");
const approvedStatuses = [
  "AVAILABLE",
  "INTERESTED",
  "SCHEDULED",
  "AGREED",
  "FLUSHED",
];
const { convertLocation } = require("../utils/helpers");
const Crap = require("../models/crap");
const validateCrap = async (req, res, next) => {
  try {
    const newData = { ...req.sanitizedBody, owner: req.user._id };

    if (req.files?.length) {
      const images = await imageLoad.uploadMany(req.files);
      newData.images = images;
    }
    if (newData.long && newData.lat) {
      newData.location = convertLocation(newData.long, newData.lat);
    }
    const newCrap = new Crap(newData);
    await newCrap.validate();
    req.sanitizedBody = newData;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCrap,
};
