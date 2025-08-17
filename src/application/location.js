import Location from "../infrastructure/entities/Location.js";
import NotFoundError from "../domain/errors/not-found-error.js";
import ValidationError from "../domain/errors/validation-error.js";

export const getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
    return;
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const userId = req.auth().userId;
    console.log("USER_ID", userId);

    const locationData = req.body;
    if (!locationData.name) {
      throw new ValidationError("Location name is required");
    }
    await Location.create(locationData);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const _id = req.params._id;
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const _id = req.params._id;
    const locationData = req.body;
    if (!locationData.name) {
      throw new ValidationError("Location name is required");
    }

    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }

    await Location.findByIdAndUpdate(_id, locationData);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const patchLocation = async (req, res, next) => {
  try {
    const _id = req.params._id;
    const locationData = req.body;
    if (!locationData.name) {
      throw new ValidationError("Location name is required");
    }
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    await Location.findByIdAndUpdate(_id, { name: locationData.name });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const _id = req.params._id;
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    await Location.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
