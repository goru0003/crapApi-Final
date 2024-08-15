const multer = require("multer");

const attachImages = multer().array("images");

module.exports = attachImages;
