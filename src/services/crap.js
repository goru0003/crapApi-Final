const { ObjectId } = require("mongodb");
const { convertLocation } = require("../utils/helpers");
const Crap = require("../models/crap");
const imageService = require("./images");
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} = require("../utils/errors");
// Retrieves all Crap documents from the mongodb
const getAll = async (query, lat, long, distance, show_taken) => {
  const filter = {
    ...(query && {
      $or: [
        { title: new RegExp(query, "i") },
        { description: new RegExp(query, "i") },
      ],
    }),
    ...(show_taken !== "true"
      ? { status: "AVAILABLE" }
      : { status: { $ne: "FLUSHED" } }),
    ...(lat &&
      long &&
      distance && {
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(long), parseFloat(lat)],
            },
            $maxDistance: parseFloat(distance),
          },
        },
      }),
  };

  try {
    const crapList = await Crap.find(filter)
      .populate("owner", "name")
      .select("-location -buyer -suggestion");

    return crapList;
  } catch (error) {
    throw new Error("Failed to fetch Crap");
  }
};
// Retrieves all Crap belonging to the specified owner
const getMine = async (owner) => {
  try {
    const myCrap = await Crap.find({
      $or: [{ owner: owner }, { buyer: owner }],
    }).populate("owner buyer", "name");

    return myCrap;
  } catch (error) {
    throw new Error("failed to fetch Crap");
  }
};
// Retrieves a Crap document by its ID
const getById = async (id) => {
  const crap = await Crap.findById(id);
  if (!crap) {
    throw new NotFoundError(`Crap with id ${id} not found.`);
  }
  return crap;
};

// Creates a new Crap document, attaches images, and saves it to the database
const create = async (owner, input, files) => {
  const location = convertLocation(input.long, input.lat);

  const images = await imageService.uploadMany(files);
  const newCrap = new Crap({
    ...input,
    images,
    owner: owner,
    location: location,
  });
  await newCrap.save();

  return newCrap;
};

// Updates a Crap document by its ID
const updateOne = async (id, input, user) => {
  const crap = await Crap.findById(id)
    .populate("owner", "name")
    .populate("buyer", "name");

  if (!crap) {
    throw new NotFoundError(`Crap with id ${id} not found.`);
  }

  if (crap.owner._id.toString() !== user.toString()) {
    throw new ForbiddenError("you can access this crap");
  }

  await Crap.updateOne({ _id: id }, input, {
    runValidators: true,
  });

  const updatedCrap = await Crap.findById(id)
    .populate("owner", "name")
    .populate("buyer", "name")
    .lean();

  return updatedCrap;
};
// Deletes a Crap document by its ID if the user is the owner
const deleteOne = async (id, user) => {
  const crap = await Crap.findById(id)
    .populate("owner", "name")
    .populate("buyer", "name");

  if (!crap) {
    throw new NotFoundError(`Crap with id ${id} not found.`);
  }

  if (crap.owner._id.toString() !== user.toString()) {
    throw new ForbiddenError("You are not authorized to delete this Crap.");
  }

  await Crap.deleteOne({ _id: id });

  return crap;
};
// Updates a Crap document to the INTERESTED status
const interestedOn = async (id, user) => {
  const crap = await Crap.findById(id)
    .populate("owner", "name")
    .populate("buyer", "name");

  if (!crap) {
    throw new NotFoundError(`Crap with id ${id} not found.`);
  }

  if (crap.status !== "AVAILABLE") {
    throw new BadRequestError("Crap is not available.");
  }

  crap.status = "INTERESTED";
  crap.buyer = user;
  await crap.save();

  const updatedCrap = await Crap.findById(id)
    .populate("owner", "name")
    .populate("buyer", "name")
    .lean();

  return updatedCrap;
};
// Suggests a time for a Crap document
const suggestTime = async (id, user, input) => {
  const crap = await Crap.findById(id)
    .populate("owner", "name")
    .populate("buyer", "name");

  if (!crap) {
    throw new NotFoundError(`Crap with id ${id} not found.`);
  }

  if (crap.owner._id.toString() !== user.toString()) {
    throw new ForbiddenError(
      "You are not authorized to suggest a time for this Crap."
    );
  }
  if (crap.status !== "INTERESTED") {
    throw new BadRequestError(
      "Crap must be in INTERESTED status to suggest a time."
    );
  }

  crap.suggestion = {
    address: input.address,
    date: new Date(input.date),
    time: input.time,
  };
  crap.status = "SCHEDULED";
  await crap.save();

  const updatedCrap = await Crap.findById(id)
    .populate("owner", "name")
    .populate("buyer", "name")
    .lean();

  return updatedCrap;
};
// Updates a Crap document to the AGREED status
const agreeToCrap = async (id, user) => {
  const crap = await Crap.findById(id)
    .populate("owner", "_id name")
    .populate("buyer", "_id name");

  if (!crap) {
    throw new NotFoundError(`Crap with id ${id} not found.`);
  }

  if (crap.status !== "SCHEDULED") {
    throw new BadRequestError("Crap must be in SCHEDULED status to agree.");
  }

  if (crap.buyer._id.toString() !== user.toString()) {
    throw new ForbiddenError("You are not authorized to agree to this Crap.");
  }

  crap.status = "AGREED";
  await crap.save();

  const updatedCrap = await Crap.findById(id)
    .populate("owner", "_id name")
    .populate("buyer", "_id name");

  return updatedCrap;
};
// Updates a Crap document to the AVAILABLE status
const disagreeToCrap = async (id, userId) => {
  let crap = await Crap.findOne({ _id: id, buyer: userId });

  if (!crap) {
    throw new ForbiddenError(`Crap ${id} doesn't belong to user ${userId}`);
  }

  if (crap.status !== "SCHEDULED") {
    throw new BadRequestError(`Crap ${id} isn't available for disagreement`);
  }

  crap = await Crap.findByIdAndUpdate(
    id,
    { status: "INTERESTED", suggestion: null },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("owner", "name _id")
    .populate("buyer", "name _id");

  return crap;
};
// Updates a Crap document to the AVAILABLE status
const resetCrap = async (id, userId) => {
  let crap = await Crap.findOne({
    _id: id,
    $or: [{ owner: userId }, { buyer: userId }],
  });

  if (!crap) {
    throw new ForbiddenError(`Crap ${id} doesn't belong to user ${userId}`);
  }

  if (crap.status === "FLUSHED") {
    throw new BadRequestError(`Crap ${id} isn't available for reset.`);
  }

  crap = await Crap.findByIdAndUpdate(
    id,
    { status: "AVAILABLE", buyer: null, suggestion: null },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("owner", "name _id")
    .populate("buyer", "name _id");

  return crap;
};
// Updates a Crap document to the FLUSHED status
const flushCrap = async (id, userId) => {
  let crap = await Crap.findOne({
    _id: id,
    owner: userId,
  });

  if (!crap) {
    throw new ForbiddenError(`Crap ${id} doesn't belong to user ${userId}`);
  }

  if (crap.status !== "AGREED") {
    throw new BadRequestError(`Crap ${id} isn't available for flush`);
  }

  crap = await Crap.findByIdAndUpdate(
    id,
    { status: "FLUSHED" },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("owner", "name _id")
    .populate("buyer", "name _id");

  return crap;
};
//exports
module.exports = {
  create,
  getAll,
  getMine,
  getById,
  updateOne,
  deleteOne,
  suggestTime,
  agreeToCrap,
  disagreeToCrap,
  interestedOn,
  resetCrap,
  flushCrap,
};
