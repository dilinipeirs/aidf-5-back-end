import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";

import { CreateHotelDTO, SearchHotelsDTO } from "../domain/dtos/hotel";
import { generateEmbedding, generateHotelEmbedding } from "../utils/embeddings";

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const getAllHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
    return;
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelData = req.body;
    const result = CreateHotelDTO.safeParse(hotelData);

    if (!result.success) {
      throw new ValidationError(`${result.error.message}`);
    }

    // Generate embedding for the new hotel
    const embedding = await generateHotelEmbedding({
      name: result.data.name,
      description: result.data.description,
      location: result.data.location,
      price: result.data.price
    });

    // Create hotel with embedding
    await Hotel.create({
      ...result.data,
      embedding
    });
    
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    if (
      !hotelData.name ||
      !hotelData.image ||
      !hotelData.location ||
      !hotelData.price ||
      !hotelData.description
    ) {
      throw new ValidationError("Invalid hotel data");
    }

    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    await Hotel.findByIdAndUpdate(_id, hotelData);
    res.status(200).json(hotelData);
  } catch (error) {
    next(error);
  }
};

export const patchHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    if (!hotelData.price) {
      throw new ValidationError("Price is required");
    }
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    await Hotel.findByIdAndUpdate(_id, { price: hotelData.price });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    await Hotel.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const searchHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;
    
    // Validate the search query
    const result = SearchHotelsDTO.safeParse({ query });
    if (!result.success) {
      throw new ValidationError(`Invalid search query: ${result.error.message}`);
    }

    const searchQuery = result.data.query;
    
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(searchQuery);
    
    // Use MongoDB Atlas vector search with aggregation pipeline
    const hotels = await Hotel.aggregate([
      {
        $vectorSearch: {
          index: "hotel_vector_index", // This should match your Atlas vector search index name
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 4
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          image: 1,
          description: 1,
          price: 1,
          rating: 1,
          reviews: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    res.status(200).json({
      hotels,
      query: searchQuery,
      count: hotels.length
    });
  } catch (error) {
    // Fallback to text-based search if vector search fails
    try {
      const { query } = req.query;
      const result = SearchHotelsDTO.safeParse({ query });
      
      if (result.success) {
        const searchQuery = result.data.query;
        const hotels = await Hotel.find({
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { location: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } }
          ]
        }).limit(4);

        res.status(200).json({
          hotels,
          query: searchQuery,
          count: hotels.length,
          fallback: true // Indicate this was a fallback search
        });
        return;
      }
    } catch (fallbackError) {
      // If fallback also fails, throw the original error
    }
    
    next(error);
  }
};
