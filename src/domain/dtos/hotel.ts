import { z } from "zod";

export const CreateHotelDTO = z.object({
  name: z.string(),
  images: z.array(z.string()),
  location: z.string(),
  price: z.number(),
  description: z.string(),
});

export const SearchHotelDTO = z.object({
  query: z.string().min(1),
});
