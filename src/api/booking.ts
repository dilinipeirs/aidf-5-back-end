import isAuthenticated from './middleware/authentication-middleware';
import express from "express";
import {
  createBooking,
  getAllBookingsForHotel,
  getAllBookings,
  getBookingById,
  getAllBookingsForUser,
} from "../application/booking";

const bookingsRouter = express.Router();

bookingsRouter.route("/").post(isAuthenticated, createBooking).get(isAuthenticated, getAllBookings);
bookingsRouter.route("/hotels/:hotelId").get(isAuthenticated, getAllBookingsForHotel);
bookingsRouter.route("/:bookingId").get(isAuthenticated, getBookingById);
bookingsRouter.route("/user/:userId").get(isAuthenticated, getAllBookingsForUser);

export default bookingsRouter;


