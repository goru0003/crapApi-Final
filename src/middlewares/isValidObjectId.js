const { isValidObjectId: validateObjectId } = require("mongoose");
const { BadRequestError } = require("../utils/errors");

const isValidObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!validateObjectId(id)) {
    throw new BadRequestError(`Malformed object id ${id}`);
  }
  next();
};

module.exports = isValidObjectId;
