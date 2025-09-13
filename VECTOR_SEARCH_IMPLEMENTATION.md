# MongoDB Atlas Vector Search Implementation Guide

## Overview
This guide explains how to implement and use the vector search endpoint for hotels in your application.

## Implementation Summary

### 1. Schema Updates
- Added `embedding` field to Hotel schema to store vector embeddings
- Field type: `[Number]` - array of numbers representing the vector

### 2. API Endpoint
- **Route**: `GET /hotels/search?query=<search_string>`
- **Function**: `searchHotels` in `src/application/hotel.ts`
- **Validation**: Uses `SearchHotelsDTO` for query validation

### 3. Current Implementation
The current implementation includes:
- Text-based search as fallback (regex search across name, location, description)
- Vector search pipeline structure (ready for MongoDB Atlas vector search)
- Returns top 4 matching hotels
- Includes search score in response

## MongoDB Atlas Vector Search Setup

### 1. Create Vector Search Index
In MongoDB Atlas, create a vector search index:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

### 2. Generate Embeddings
You'll need to generate embeddings for:
- Existing hotel documents (name, description, location)
- Search queries from users

### 3. Update Search Function
Replace the text-based search with actual vector search:

```typescript
// Generate embedding for search query (using OpenAI or similar)
const queryEmbedding = await generateEmbedding(searchQuery);

// Use aggregation pipeline for vector search
const hotels = await Hotel.aggregate([
  {
    $vectorSearch: {
      index: "hotel_vector_index",
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
```

## Usage Examples

### Basic Search
```bash
GET /hotels/search?query=luxury hotel paris
```

### Response Format
```json
{
  "hotels": [
    {
      "_id": "...",
      "name": "Montmartre Majesty Hotel",
      "location": "Paris, France",
      "image": "...",
      "description": "...",
      "price": 160,
      "rating": 4.7,
      "reviews": [],
      "score": 0.95
    }
  ],
  "query": "luxury hotel paris",
  "count": 1
}
```

## Next Steps for Full Vector Search

1. **Install embedding generation library**:
   ```bash
   npm install openai
   ```

2. **Create embedding generation utility**:
   ```typescript
   import OpenAI from 'openai';
   
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
   });
   
   export const generateEmbedding = async (text: string): Promise<number[]> => {
     const response = await openai.embeddings.create({
       model: "text-embedding-ada-002",
       input: text,
     });
     return response.data[0].embedding;
   };
   ```

3. **Update existing hotels with embeddings**:
   ```typescript
   // Migration script to add embeddings to existing hotels
   const hotels = await Hotel.find({ embedding: { $size: 0 } });
   
   for (const hotel of hotels) {
     const textToEmbed = `${hotel.name} ${hotel.description} ${hotel.location}`;
     const embedding = await generateEmbedding(textToEmbed);
     await Hotel.findByIdAndUpdate(hotel._id, { embedding });
   }
   ```

4. **Update createHotel function** to generate embeddings for new hotels

## Testing the Endpoint

You can test the current text-based search implementation:

```bash
# Test with existing data
curl "http://localhost:3000/hotels/search?query=paris"
curl "http://localhost:3000/hotels/search?query=luxury"
curl "http://localhost:3000/hotels/search?query=sydney"
```

The endpoint is now ready and will return relevant hotels based on text matching. To enable full vector search, follow the additional setup steps above.
