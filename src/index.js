import "dotenv/config";
import express from "express";
import hotelsRouter from "./api/hotel.js";
import bookingsRouter from "./api/booking.js";
import connectDB from "./infrastructure/db.js";

const app = express();

// Convert HTTP payloads into JS objects
app.use(express.json());

app.use("/api/hotels", hotelsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/reviews", reviewRouter);

connectDB();

const PORT = 8000;
app.listen(PORT, () => {
  console.log("Server is listening on PORT: ", PORT);
});
