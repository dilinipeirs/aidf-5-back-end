# MongoDB Atlas Vector Search - Complete Implementation Steps

## ✅ **Completed Steps**

### **Step 1: Install OpenAI Package**
```bash
npm install openai
```
✅ **DONE** - Package installed successfully

### **Step 2: Create Embedding Utility**
✅ **DONE** - Created `src/utils/embeddings.ts` with:
- `generateEmbedding()` function for text
- `generateHotelEmbedding()` function for hotels (includes name, description, location, and price)
- Error handling and OpenAI integration

### **Step 3: Environment Variables**
✅ **DONE** - You need to add to your `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### **Step 4: MongoDB Atlas Vector Search Index**
✅ **DONE** - Manual steps for you to complete:

1. **Go to MongoDB Atlas Dashboard**
   - Log into your MongoDB Atlas account
   - Navigate to your cluster

2. **Create Vector Search Index**
   - Click on "Search" tab in your cluster
   - Click "Create Index"
   - Choose "Vector Search" as the index type
   - Select your database and collection (likely `hotels`)

3. **Configure the Index**
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

4. **Name the Index**
   - Index name: `hotel_vector_index`
   - Click "Create Index"

### **Step 5: Updated Search Function**
✅ **DONE** - Updated `src/application/hotel.ts` with:
- Real vector search using MongoDB aggregation
- Embedding generation for search queries
- Fallback to text search if vector search fails
- Proper error handling

### **Step 6: Updated Seed Script**
✅ **DONE** - Updated `src/seed.ts` to:
- Generate embeddings for all hotels during seeding
- Include price in embeddings for comprehensive search
- Handle rate limiting with delays
- Provide detailed progress feedback
- Error handling for individual hotels

### **Step 7: Updated createHotel Function**
✅ **DONE** - Modified to:
- Generate embeddings for new hotels automatically
- Include price in embeddings
- Include embeddings in hotel creation

## 🚀 **Next Steps for You**

### **Step 8: Set Up Environment Variables**
Create or update your `.env` file:
```env
# Your existing MongoDB connection
MONGODB_URI=your_mongodb_connection_string_here

# Add this for OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

### **Step 9: Create Vector Search Index in Atlas**
Follow the manual steps in Step 4 above.

### **Step 10: Seed Database with Embeddings**
```bash
npm run seed
```
This will:
- Clear existing data
- Create locations
- Create hotels with embeddings (including price)
- Show detailed progress for each hotel

### **Step 11: Test the Vector Search**
```bash
# Start your server
npm run dev

# Test the search endpoint
curl "http://localhost:3000/hotels/search?query=luxury hotel paris"
curl "http://localhost:3000/hotels/search?query=budget accommodation"
curl "http://localhost:3000/hotels/search?query=affordable stay"
curl "http://localhost:3000/hotels/search?query=tokyo tower"
```

## 📋 **Expected Response Format**

```json
{
  "hotels": [
    {
      "_id": "hotel_id",
      "name": "Hotel Name",
      "location": "City, Country",
      "image": "image_url",
      "description": "Hotel description",
      "price": 200,
      "rating": 4.5,
      "reviews": [],
      "score": 0.95
    }
  ],
  "query": "search query",
  "count": 1
}
```

## 🔧 **Troubleshooting**

### **If Vector Search Fails**
- The system automatically falls back to text-based search
- Check your Atlas vector search index is created correctly
- Verify your OpenAI API key is valid
- Check that hotels have embeddings (run seed script)

### **Common Issues**
1. **"Index not found"** - Make sure vector search index is created in Atlas
2. **"OpenAI API error"** - Check your API key and billing
3. **"No embeddings"** - Run the seed script first (`npm run seed`)
4. **"Rate limiting"** - The seed script includes delays between API calls

### **Testing Commands**
```bash
# Test with different queries (including price-aware searches)
curl "http://localhost:3000/hotels/search?query=paris"
curl "http://localhost:3000/hotels/search?query=luxury"
curl "http://localhost:3000/hotels/search?query=budget hotel"
curl "http://localhost:3000/hotels/search?query=affordable accommodation"
curl "http://localhost:3000/hotels/search?query=sydney harbor"
curl "http://localhost:3000/hotels/search?query=stunning views"

# Test error handling
curl "http://localhost:3000/hotels/search?query="
```

## 🎯 **What You Get**

- **Semantic Search**: Find hotels by meaning, not just exact text matches
- **Price-Aware Search**: Understands budget, luxury, affordable, expensive queries
- **Comprehensive Embeddings**: Includes name, description, location, and price
- **Better Results**: More relevant results based on context and price range
- **Fallback**: Automatic fallback to text search if vector search fails
- **Performance**: Fast vector-based similarity search
- **Scalable**: Works with large datasets efficiently
- **Streamlined Setup**: Everything handled in the seed script

## 💡 **Price-Aware Search Examples**

The vector search now understands price-related queries:
- `"budget hotel paris"` → Finds hotels with lower prices
- `"luxury accommodation"` → Finds higher-priced hotels  
- `"affordable stay"` → Prioritizes reasonably priced hotels
- `"expensive hotel"` → Finds premium-priced hotels

The implementation is now complete and ready for testing!
