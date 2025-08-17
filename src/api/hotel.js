import express from "express";
import {
  getAllHotels,
  createHotel,
  getHotelById,
  updateHotel,
  patchHotel,
  deleteHotel,
} from "../application/hotel.js";
import isAuthenticated from "./middleware/authentication-middleware.js";

const hotelsRouter = express.Router();

const preMiddleware = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

hotelsRouter
  .route("/")
  .get(getAllHotels)
  .post(createHotel);

hotelsRouter
  .route("/:_id")
  .get(isAuthenticated, getHotelById)
  .put(updateHotel)
  .patch(patchHotel)
  .delete(deleteHotel);

export default hotelsRouter;
