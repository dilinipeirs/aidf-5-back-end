import "dotenv/config";
import connectDB from "./infrastructure/db";

import Hotel from "./infrastructure/entities/Hotel";
import Location from "./infrastructure/entities/Location";
import { generateEmbedding } from "./application/utils/embeddings";

// Configuration
const TARGET_HOTEL_COUNT = 50; // ~50 hotels

// Reuse existing image URLs
const imageUrls = [
  "https://cf.bstatic.com/xdata/images/hotel/max1280x900/297840629.jpg?k=d20e005d5404a7bea91cb5fe624842f72b27867139c5d65700ab7f69396026ce&o=&hp=1",
  "https://cf.bstatic.com/xdata/images/hotel/max1280x900/596257607.jpg?k=0b513d8fca0734c02a83d558cbad7f792ef3ac900fd42c7d783f31ab94b4062c&o=&hp=1",
  "https://cf.bstatic.com/xdata/images/hotel/max1280x900/308797093.jpg?k=3a35a30f15d40ced28afacf4b6ae81ea597a43c90c274194a08738f6e760b596&o=&hp=1",
  "https://cf.bstatic.com/xdata/images/hotel/max1280x900/84555265.jpg?k=ce7c3c699dc591b8fbac1a329b5f57247cfa4d13f809c718069f948a4df78b54&o=&hp=1",
];

// Countries with a handful of cities (max 8 countries)
const countryToCities: Record<string, string[]> = {
  France: ["Paris", "Lyon", "Nice", "Bordeaux", "Marseille", "Toulouse"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"],
  Japan: ["Tokyo", "Osaka", "Kyoto", "Sapporo", "Fukuoka", "Yokohama"],
  "United States": [
    "New York",
    "Los Angeles",
    "Chicago",
    "Miami",
    "San Francisco",
    "Seattle",
  ],
  Italy: ["Rome", "Milan", "Venice", "Florence", "Naples", "Turin"],
  Spain: ["Barcelona", "Madrid", "Seville", "Valencia", "Granada", "Bilbao"],
  "United Kingdom": [
    "London",
    "Manchester",
    "Edinburgh",
    "Bristol",
    "Liverpool",
    "Birmingham",
  ],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Quebec City"],
};

// Description templates
const descriptionBuilders: Array<(city: string) => string> = [
  (city) =>
    `Experience the charm of ${city} with this luxurious hotel. Enjoy stunning views and exceptional service.`,
  (city) =>
    `A stylish retreat in ${city}, perfect for business and leisure with top-notch amenities.`,
  (city) =>
    `Nestled in ${city}, this modern hotel offers comfort, convenience, and warm hospitality.`,
  (city) =>
    `Discover ${city} from this elegant base with spacious rooms and panoramic views.`,
];

const adjectives = [
  "Grand",
  "Royal",
  "Elegant",
  "Majestic",
  "Serene",
  "Vibrant",
  "Urban",
  "Coastal",
  "Heritage",
  "Panorama",
];

const nouns = [
  "Vista",
  "Harbor",
  "Gardens",
  "Plaza",
  "Palace",
  "Retreat",
  "Lodge",
  "Suites",
  "Resort",
  "Inn",
  "Residence",
];

const ratingChoices = [4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];

const generateHotels = (targetCount: number) => {
  const pairs: Array<{ city: string; country: string }> = [];
  Object.entries(countryToCities).forEach(([country, cities]) => {
    cities.forEach((city) => pairs.push({ city, country }));
  });

  const hotels = [] as Array<{
    name: string;
    description: string;
    image: string;
    location: string;
    rating: number;
    price: number;
  }>;

  for (let i = 0; i < targetCount; i++) {
    const pair = pairs[i % pairs.length];
    const city = pair.city;
    const country = pair.country;
    const name = `${adjectives[i % adjectives.length]} ${city} ${nouns[i % nouns.length]}`;
    const description = descriptionBuilders[i % descriptionBuilders.length](city);
    const image = imageUrls[i % imageUrls.length];
    const rating = ratingChoices[i % ratingChoices.length];
    const price = 110 + (i % 15) * 10 + (city.length % 5) * 3; // varied but reasonable

    hotels.push({
      name,
      description,
      image,
      location: `${city}, ${country}`,
      rating,
      price,
    });
  }

  return hotels;
};

const hotels = generateHotels(TARGET_HOTEL_COUNT);

// Locations data: country names (max 8)
const locations = Object.keys(countryToCities).map((name) => ({ name }));

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data

    await Hotel.deleteMany({});
    await Location.deleteMany({});

    console.log("Cleared existing data");

    // Insert locations
    const createdLocations = await Location.insertMany(locations);
    console.log(`Created ${createdLocations.length} locations`);

    // Insert hotels
    // Map original hotels array to a new array with the additional embedding field generated via generateEmbedding

    const hotelsWithEmbedding = hotels.map(async (hotel) => {
      console.log("Embedding hotel", hotel.name);
      
      const embedding = await generateEmbedding(
        `${hotel.name} ${hotel.description} ${hotel.location} ${hotel.price}`
      );
      return { ...hotel, embedding };
    });

    const toBeCreatedHotels = await Promise.all(hotelsWithEmbedding);

    const createdHotels = await Hotel.insertMany(toBeCreatedHotels);
    console.log(`Created ${createdHotels.length} hotels`);
    console.log("Database seeded successfully!");

    // Display summary
    console.log("\n=== SEED SUMMARY ===");
    console.log(`Locations: ${createdLocations.length}`);
    console.log(`Hotels: ${createdHotels.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed script
seedDatabase();
