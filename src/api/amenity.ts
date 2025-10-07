import express from "express";
import {
  getAllAmenities,
  getAmenityById
} from "../application/amenity";

const amenitiesRouter = express.Router();

amenitiesRouter
  .route("/")
  .get(getAllAmenities);

amenitiesRouter
  .route("/:_id")
  .get(getAmenityById);

export default amenitiesRouter; 