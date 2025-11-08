# Project Synapse Backend

Backend API for Project Synapse - Your Second Brain

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string:
   - For local MongoDB: `mongodb://localhost:27017/synapse`
   - For MongoDB Atlas: Get your connection string from the Atlas dashboard

4. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

## API Endpoints

### Base URL
`http://localhost:5000`

### Endpoints

#### Save Memory
- **POST** `/api/memories/save`
- Body:
```json
{
  "text": "Your highlighted text",
  "url": "https://example.com",
  "title": "Page Title",
  "context": "Optional context or notes",
  "tags": ["tag1", "tag2"]
}
```

#### Get All Memories
- **GET** `/api/memories/all`
- Returns all saved memories sorted by creation date (newest first)

#### Search Memories
- **GET** `/api/memories/search?query=keyword`
- Searches through text, title, and context fields

#### Delete Memory
- **DELETE** `/api/memories/:id`
- Deletes a memory by ID

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled for frontend integration
