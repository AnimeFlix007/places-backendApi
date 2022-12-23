const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../utils/Location");
const Place = require("../models/Place");
const User = require('../models/User');
const mongoose = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Place not found", 404));
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userPlaces;
  try {
    // userPlaces = await Place.find({ creator: userId });
    userPlaces = await User.findById(userId).populate('places')
  } catch (error) {
    return next(new HttpError("No place found regarding that user...", 500));
  }
  if (!userPlaces || userPlaces.places.length === 0) {
    return next(new HttpError("No place found regarding that user...", 404));
  }
  res.json({
    userPlaces: userPlaces.places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const { title, description, address, creator } = req.body;

  if (title.trim().length === 0 || !title) {
    return next(new HttpError("Title is Empty"));
  }
  if (description.trim().length <= 4 || !description) {
    return next(new HttpError("Description is less than 4 letters"));
  }

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(new HttpError("Enter a valid place that can be recognized", 404));
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg",
    creator
  });

  let user

  try {
    user = await User.findById(creator)
  } catch (error) {
    return next(new HttpError('Something went wrong! please try again', 500))
  }

  if(!user) {
    const err = new HttpError("User not Found", 404)
    return next(err);
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdPlace.save({ session: sess })
    user.places.push(createdPlace)
    await user.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
      );
      return next(error);
    }
    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const { title, description } = req.body;

  if (title.trim().length === 0) {
    return next(new HttpError("Title is Empty"));
  }
  if (description.trim().length <= 4) {
    return next(new HttpError("Description is less than 4 letters"));
  }

  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError("Place Not found", 404);
    return next(err);
  }

  place.title = title;
  place.description = description;

  let updatedPlace;
  try {
    updatedPlace = await place.save();
  } catch (error) {
    const err = new HttpError("Something went wrong! Unable to update..", 500);
    return next(err);
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (error) {
    const err = new HttpError("Place Not found", 404);
    return next(err);
  }

  if(!place) {
    return next(new HttpError('Place not found', 404))
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await place.remove({ session: sess });
    place.creator.places.pull(place)
    await place.creator.save({ session: sess })
    await sess.commitTransaction()
  } catch (error) {
    const err = new HttpError("Something went wrong! Unable to delete..", 500);
    return next(err);
  }

  res.status(200).json({ message: "Place Deleted" });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
