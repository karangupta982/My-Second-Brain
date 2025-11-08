import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import memoryRoutes from './routes/memory.js';
import semanticSearchRoutes from './routes/semanticSearch.js';
import { preloadLocalModel } from './services/localEmbedding.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Preload local embedding model (async, non-blocking)
console.log('🚀 Preloading local embedding model...');
preloadLocalModel()
  .then(() => {
    console.log('✅ Local embedding model ready');
  })
  .catch((error) => {
    console.warn('⚠️  Local embedding model failed to load:', error.message);
    console.warn('   Semantic search will use OpenAI API if configured');
  });

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies with larger limit
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// Serve static files (images)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Routes
app.use('/api/memories', memoryRoutes);
app.use('/api/memories', semanticSearchRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Project Synapse API',
    version: '2.0.0',
    endpoints: {
      saveMemory: 'POST /api/memories/save',
      getAllMemories: 'GET /api/memories/all',
      searchMemories: 'GET /api/memories/search?query=keyword',
      semanticSearch: 'POST /api/memories/semantic-search',
      generateEmbeddings: 'POST /api/memories/generate-embeddings',
      embeddingStats: 'GET /api/memories/embedding-stats',
      searchSettings: 'POST /api/memories/search-settings',
      deleteMemory: 'DELETE /api/memories/:id',
      getByUrl: 'GET /api/memories/by-url?url=domain.com',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
