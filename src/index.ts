import "dotenv/config";

import express from "express";
import cors from "cors";

import hotelsRouter from "./api/hotel";
import bookingsRouter from "./api/booking";
import paymentsRouter from "./api/payment";
import connectDB from "./infrastructure/db";
import reviewRouter from "./api/review";
import locationsRouter from "./api/location";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";

import { clerkMiddleware } from "@clerk/express";
import bodyParser from "body-parser";
import { handleWebhook } from "./application/payment";

const app = express();

// Stripe webhook must use raw body before json parser
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// Convert HTTP payloads into JS objects (after webhook)
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(clerkMiddleware()); // Reads the JWT from the request and sets the auth object on the request

// app.use((req, res, next) => {
//   console.log(req.method, req.url);
//   next();
// });

app.use("/api/hotels", hotelsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/locations", locationsRouter);

app.use(globalErrorHandlingMiddleware);

connectDB();

const PORT = 8000;
app.listen(PORT, () => {
  console.log("Server is listening on PORT: ", PORT);
});