import express from "express";
import { createReview, getReviewsForHotel } from "../application/review.js";

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);
reviewRouter.get("/hotel/:hotelId", getReviewsForHotel); //! /api/reviews/hotel/:hotelId

export default reviewRouter;