import express from "express";
import {
  getAllBookings,
  getBookingById,
  getAllBookingsForHotel,
  createBooking,
} from "../application/booking.js";

const bookingsRouter = express.Router();

// Get all bookings
bookingsRouter.get("/", getAllBookings);

// Get booking by ID
bookingsRouter.get("/:_id", getBookingById);

// Get all bookings for a specific hotel
bookingsRouter.get("/hotel/:hotelId", getAllBookingsForHotel);

// Create a new booking
bookingsRouter.post("/", createBooking);

export default bookingsRouter; 