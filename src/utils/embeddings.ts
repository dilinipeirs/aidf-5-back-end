import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embedding for text using OpenAI's text-embedding-ada-002 model
 * @param text - The text to generate embedding for
 * @returns Promise<number[]> - Array of numbers representing the vector embedding
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Generate embedding for hotel data by combining name, description, location, and price
 * @param hotel - Hotel object with name, description, location, and price
 * @returns Promise<number[]> - Array of numbers representing the vector embedding
 */
export const generateHotelEmbedding = async (hotel: {
  name: string;
  description: string;
  location: string;
  price: number;
}): Promise<number[]> => {
  // Include price in the text to embed for better semantic search
  const textToEmbed = `${hotel.name} ${hotel.description} ${hotel.location} price ${hotel.price} dollars`;
  return generateEmbedding(textToEmbed);
};
