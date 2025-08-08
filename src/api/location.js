import express from "express";
import {
  getAllLocations,
  createLocation,
  getLocationById,
  updateLocation,
  patchLocation,
  deleteLocation,
} from "../application/location.js";

const locationsRouter = express.Router();

locationsRouter
  .route("/")
  .get(getAllLocations)
  .post(createLocation);

locationsRouter
  .route("/:_id")
  .get(getLocationById)
  .put(updateLocation)
  .patch(patchLocation)
  .delete(deleteLocation);

export default locationsRouter; 