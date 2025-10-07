import Amenity from "../infrastructure/entities/Amenity";
import NotFoundError from "../domain/errors/not-found-error";
import { Request, Response, NextFunction } from "express";

export const getAllAmenities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const amenities = await Amenity.find();
    res.status(200).json(amenities);
    return;
  } catch (error) {
    next(error);
  }
};

export const getAmenityById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const amenity = await Amenity.findById(_id);
    if (!amenity) {
      throw new NotFoundError("Amenity not found");
    }
    res.status(200).json(amenity);
  } catch (error) {
    next(error);
  }
};

