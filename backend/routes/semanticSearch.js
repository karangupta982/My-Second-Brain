import express from 'express';
import {
  semanticSearch,
  generateEmbeddingsBatch,
  getEmbeddingStatistics,
  updateSearchSettings,
} from '../controllers/semanticSearchController.js';

const router = express.Router();

// Semantic search endpoint
router.post('/semantic-search', semanticSearch);

// Batch generate embeddings for existing memories
router.post('/generate-embeddings', generateEmbeddingsBatch);

// Get embedding statistics
router.get('/embedding-stats', getEmbeddingStatistics);

// Update search settings (API key, method)
router.post('/search-settings', updateSearchSettings);

export default router;
