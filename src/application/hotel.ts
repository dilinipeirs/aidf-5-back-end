import Hotel from "../infrastructure/entities/Hotel";
import Amenity from "../infrastructure/entities/Amenity";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { generateEmbedding } from "./utils/embeddings";
import stripe from "../infrastructure/stripe";

import { CreateHotelDTO, SearchHotelDTO } from "../domain/dtos/hotel";

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Get all hotels with amenity names as string array and without embeddings
 * Returns a lightweight response with essential hotel information
 */
export const getAllHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch hotels with populated amenities, excluding embeddings for lightweight response
    const hotels = await Hotel.find()
      .populate('amenities', 'name') // Populate amenity names only
      .select('-embedding') // Exclude embeddings field to reduce response size
      .lean(); // Use lean() for better performance
    
    // Transform amenities from objects to string array for cleaner API response
    const hotelsWithAmenityNames = hotels.map(hotel => ({
      ...hotel,
      amenities: hotel.amenities.map((amenity: any) => amenity.name) // Extract only the name strings
    }));
    
    res.status(200).json(hotelsWithAmenityNames);
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllHotelsBySearchQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = SearchHotelDTO.safeParse(req.query);
    if (!result.success) {
      throw new ValidationError(`${result.error.message}`);
    }
    const { query } = result.data;

    // console.log(query);

    const queryEmbedding = await generateEmbedding(query);
    // console.log(queryEmbedding);

    const hotels = await Hotel.aggregate([
      {
        // searching
        $vectorSearch: {
          index: "hotel_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          // numCandidates specifies how many top-matching documents to consider before applying the final limit.
          numCandidates: 10,
          limit: 4,
        },
      },
      {
        // map the vector results from the hotels collection
        // 1 indicates, we are mapping, 0 indicates we dont
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          price: 1,
          images: 1,
          rating: 1,
          reviews: 1,
          amenities: 1,
          score: { $meta: "vectorSearchScore" }, // the similarity
        },
      },
    ]);

    console.log(hotels);
    res.status(200).json(hotels);
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

    const embedding = await generateEmbedding(
      `${result.data.name} ${result.data.description} ${result.data.location} ${result.data.price}`
    );

    // Create Stripe product with default price for the nightly rate
    const product = await stripe.products.create({
      name: result.data.name,
      description: result.data.description,
      default_price_data: {
        unit_amount: Math.round(result.data.price * 100),
        currency: "usd",
      },
    });

    const defaultPriceId =
      typeof product.default_price === "string"
        ? product.default_price
        : (product.default_price as any)?.id;

    await Hotel.create({
      ...result.data,
      embedding,
      stripePriceId: defaultPriceId,
    });
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific hotel by ID with amenity names as string array and without embeddings
 * Returns detailed hotel information in a lightweight format
 */
export const getHotelById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    
    // Fetch hotel with populated amenities, excluding embeddings for lightweight response
    const hotel = await Hotel.findById(_id)
      .populate('amenities', 'name') // Populate amenity names only
      .select('-embedding') // Exclude embeddings field to reduce response size
      .lean(); // Use lean() for better performance
    
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    
    // Transform amenities from objects to string array for cleaner API response
    const hotelWithAmenityNames = {
      ...hotel,
      amenities: hotel.amenities.map((amenity: any) => amenity.name) // Extract only the name strings
    };
    
    res.status(200).json(hotelWithAmenityNames);
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
      !hotelData.images ||
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

export const createHotelStripePrice = async (
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

    // Create a product with default price for the hotel's nightly rate
    const product = await stripe.products.create({
      name: hotel.name,
      description: hotel.description,
      default_price_data: {
        unit_amount: Math.round(hotel.price * 100),
        currency: "usd",
      },
    });

    const defaultPriceId =
      typeof product.default_price === "string"
        ? product.default_price
        : (product.default_price as any)?.id;

    const updated = await Hotel.findByIdAndUpdate(
      _id,
      { stripePriceId: defaultPriceId },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
