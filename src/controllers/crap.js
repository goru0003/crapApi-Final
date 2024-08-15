const Crap = require("../models/crap");
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../utils/errors");
const crapService = require("../services/crap");
const { request } = require("express");

// List all crap (excluding taken ones)
const getAllCrap = async (req, res, next) => {
  try {
    const { query, lat, long, distance, show_taken } = req.query;
    const crapList = await crapService.getAll(
      query,
      lat,
      long,
      distance,
      show_taken
    );

    res.status(200).json({ data: crapList });
  } catch (error) {
    next(error);
  }
};
// Get all crap belonging to the authenticated user (buyer or seller)
const getMyCrap = async (req, res, next) => {
  try {
    const myCrap = await crapService.getMine(req.user._id);

    res.status(200).json({ data: myCrap });
  } catch (error) {
    next(error);
  }
};
// Get details of a specific crap by ID
const getCrapById = async (req, res, next) => {
  try {
    const crap = await Crap.findById(req.params.id).populate(
      "owner buyer",
      "name"
    );
    if (!crap)
      throw new NotFoundError(`Crap with id ${req.params.id} not found.`);

    const isOwnerOrBuyer =
      crap.owner._id.equals(req.user._id) ||
      (crap.buyer && crap.buyer._id.equals(req.user._id));

    if (!isOwnerOrBuyer) {
      crap.location = undefined;
      crap.buyer = undefined;
      crap.suggestion = undefined;
    }

    res.status(200).json({ data: crap });
  } catch (error) {
    next(error);
  }
};

//create a new crap
const createCrap = async (req, res, next) => {
  try {
    const newCrap = await crapService.create(
      req.user._id,
      req.sanitizedBody,
      req.files
    );
    res.status(201).json({ data: newCrap });
  } catch (error) {
    next(error);
  }
};
// Update a crap by replacing it
const updateCrap = async (req, res, next) => {
  try {
    const updatedCrap = await crapService.updateOne(
      req.params.id,
      req.sanitizedBody,
      req.user._id
    );
    res.status(200).json({ data: updatedCrap });
  } catch (error) {
    next(error);
  }
};
// Delete a crap
const deleteCrap = async (req, res, next) => {
  try {
    const deletedCrap = await crapService.deleteOne(
      req.params.id,
      req.user._id
    );

    res.status(200).json({ data: deletedCrap });
  } catch (error) {
    next(error);
  }
};

// Buyer lets Seller know they are interested
const interestedOn = async (req, res, next) => {
  try {
    const interestedCrap = await crapService.interestedOn(
      req.params.id,
      req.user._id
    );
    res.status(200).json({ data: interestedCrap });
  } catch (error) {
    next(error);
  }
};
// Seller suggests a time and location for the exchange
const suggestTime = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedCrap = await crapService.suggestTime(
      id,
      req.user._id,
      req.sanitizedBody
    );

    res.status(200).json({ data: updatedCrap });
  } catch (error) {
    next(error);
  }
};

// Buyer agrees to the suggested time
const agreeToCrap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user._id;

    const updatedCrap = await crapService.agreeToCrap(id, user);

    res.status(200).json({ data: updatedCrap });
  } catch (error) {
    next(error);
  }
};
// Buyer disagrees with the suggested time
const disagreeToCrap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user._id;

    const updatedCrap = await crapService.disagreeToCrap(id, user);

    res.status(200).json({ data: updatedCrap });
  } catch (error) {
    next(error);
  }
};
// Buyer or seller wants to reset the process
const resetCrap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const crap = await crapService.resetCrap(id, req.user._id);

    res.status(200).json({
      data: crap,
    });
  } catch (err) {
    next(err);
  }
};
// Seller indicates the crap has been flushed (taken away)
const flushCrap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const crap = await crapService.flushCrap(id, req.user._id);

    res.status(200).json({
      data: crap,
    });
  } catch (err) {
    next(err);
  }
};
// Export all functions
module.exports = {
  getAllCrap,
  getMyCrap,
  getCrapById,
  createCrap,
  updateCrap,
  deleteCrap,
  interestedOn,
  suggestTime,
  agreeToCrap,
  disagreeToCrap,
  resetCrap,
  flushCrap,
};
