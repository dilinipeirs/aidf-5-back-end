import Booking from "../infrastructure/entities/Booking.js";
import Hotel from "../infrastructure/entities/Hotel.js";

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('hotelId', 'name location');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { _id } = req.params;
    const booking = await Booking.findById(_id).populate('hotelId', 'name location image');
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
};

export const getAllBookingsForHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    // Verify hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    
    const bookings = await Booking.find({ hotelId }).populate('hotelId', 'name location');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings for hotel" });
  }
};

export const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate required fields
    if (!bookingData.hotelId || !bookingData.userId || !bookingData.checkIn || 
        !bookingData.checkOut || !bookingData.roomNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Validate hotel exists
    const hotel = await Hotel.findById(bookingData.hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    
    // Validate dates
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const now = new Date();
    
    if (checkIn < now) {
      return res.status(400).json({ error: "Check-in date cannot be in the past" });
    }
    
    if (checkOut <= checkIn) {
      return res.status(400).json({ error: "Check-out date must be after check-in date" });
    }
    
    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      hotelId: bookingData.hotelId,
      roomNumber: bookingData.roomNumber,
      $or: [
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn }
        }
      ]
    });
    
    if (conflictingBooking) {
      return res.status(409).json({ error: "Room is already booked for the selected dates" });
    }
    
    const booking = new Booking({
      ...bookingData,
      checkIn,
      checkOut
    });
    
    await booking.save();
    
    // Populate hotel details for response
    await booking.populate('hotelId', 'name location');
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
}; 