import Memory from '../models/Memory.js';
import { parseQuery, formatParsedQuery } from '../services/queryParser.js';
import { generateOpenAIEmbedding, isOpenAIConfigured } from '../services/openaiEmbedding.js';
import { generateLocalEmbedding, isLocalModelReady } from '../services/localEmbedding.js';
import { searchByEmbedding, hybridSearch, getEmbeddingStats } from '../services/vectorSearch.js';

// @desc    Semantic search for memories
// @route   POST /api/memories/semantic-search
// @access  Public
export const semanticSearch = async (req, res) => {
  try {
    const { query, searchMethod = 'auto', useHybrid = false } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    console.log(`\n🔍 Semantic Search Query: "${query}"`);

    // Parse the query
    const parsedQuery = parseQuery(query);
    console.log('📊 Parsed Query:', formatParsedQuery(parsedQuery));

    // Determine which embedding method to use
    let embeddingMethod = searchMethod;

    if (searchMethod === 'auto') {
      if (isOpenAIConfigured()) {
        embeddingMethod = 'openai';
      } else if (isLocalModelReady()) {
        embeddingMethod = 'local';
      } else {
        embeddingMethod = 'keyword';
      }
    }

    console.log(`🤖 Using search method: ${embeddingMethod}`);

    // If keyword-only search, use MongoDB text search
    if (embeddingMethod === 'keyword') {
      return keywordSearch(req, res, parsedQuery);
    }

    // Generate embedding for the search query
    let queryEmbedding;
    try {
      if (embeddingMethod === 'openai') {
        queryEmbedding = await generateOpenAIEmbedding(parsedQuery.semanticTerms);
      } else {
        queryEmbedding = await generateLocalEmbedding(parsedQuery.semanticTerms);
      }
    } catch (error) {
      console.error('Error generating query embedding:', error.message);

      // Fallback to keyword search
      console.log('⚠️  Falling back to keyword search');
      return keywordSearch(req, res, parsedQuery);
    }

    // Perform vector search or hybrid search
    const searchOptions = {
      limit: 50,
      threshold: 0.3,
      dateFilter: parsedQuery.dateFilter,
      domain: parsedQuery.domain,
      tags: parsedQuery.tags,
    };

    let results;

    if (useHybrid && parsedQuery.semanticTerms) {
      // Hybrid search (vector + keyword)
      console.log('🔀 Performing hybrid search');
      results = await hybridSearch(queryEmbedding, parsedQuery.semanticTerms, searchOptions);
    } else {
      // Pure vector search
      console.log('🎯 Performing vector search');
      results = await searchByEmbedding(queryEmbedding, searchOptions);
    }

    console.log(`✅ Found ${results.length} results`);

    res.status(200).json({
      success: true,
      searchType: useHybrid ? 'hybrid' : 'semantic',
      embeddingMethod,
      parsedQuery: {
        semanticTerms: parsedQuery.semanticTerms,
        dateFilter: parsedQuery.dateFilter,
        type: parsedQuery.type,
        domain: parsedQuery.domain,
        tags: parsedQuery.tags,
      },
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Error in semantic search:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
};

// @desc    Keyword search fallback
// @route   Used internally when semantic search not available
// @access  Private
async function keywordSearch(req, res, parsedQuery) {
  try {
    console.log('🔤 Performing keyword search');

    const query = { $text: { $search: parsedQuery.semanticTerms || parsedQuery.originalQuery } };

    // Apply filters
    if (parsedQuery.dateFilter) {
      query.createdAt = {
        $gte: parsedQuery.dateFilter.start,
        $lte: parsedQuery.dateFilter.end,
      };
    }

    if (parsedQuery.domain) {
      query.url = { $regex: parsedQuery.domain, $options: 'i' };
    }

    if (parsedQuery.tags && parsedQuery.tags.length > 0) {
      query.tags = { $in: parsedQuery.tags };
    }

    const memories = await Memory.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);

    console.log(`✅ Found ${memories.length} results (keyword search)`);

    res.status(200).json({
      success: true,
      searchType: 'keyword',
      embeddingMethod: 'none',
      parsedQuery: {
        semanticTerms: parsedQuery.semanticTerms,
        dateFilter: parsedQuery.dateFilter,
        type: parsedQuery.type,
        domain: parsedQuery.domain,
        tags: parsedQuery.tags,
      },
      count: memories.length,
      data: memories,
    });
  } catch (error) {
    console.error('Error in keyword search:', error);
    throw error;
  }
}

// @desc    Generate embeddings for all memories without embeddings
// @route   POST /api/memories/generate-embeddings
// @access  Public
export const generateEmbeddingsBatch = async (req, res) => {
  try {
    const { method = 'auto', force = false } = req.body;

    console.log('🚀 Starting batch embedding generation');

    // Find memories without embeddings
    const query = force
      ? {} // Regenerate all
      : {
          $or: [
            { embedding: { $exists: false } },
            { embedding: null },
          ],
        };

    const memories = await Memory.find(query);

    if (memories.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All memories already have embeddings',
        processed: 0,
        total: 0,
      });
    }

    console.log(`📊 Found ${memories.length} memories to process`);

    // Determine embedding method
    let embeddingMethod = method;
    if (method === 'auto') {
      embeddingMethod = isOpenAIConfigured() ? 'openai' : 'local';
    }

    if (embeddingMethod === 'openai' && !isOpenAIConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'OpenAI is not configured. Please provide API key or use local method.',
      });
    }

    console.log(`🤖 Using embedding method: ${embeddingMethod}`);

    // Process in batches
    let processed = 0;
    let failed = 0;

    for (const memory of memories) {
      try {
        const textToEmbed = `${memory.title}. ${memory.text}`;

        let embedding;
        if (embeddingMethod === 'openai') {
          embedding = await generateOpenAIEmbedding(textToEmbed);
        } else {
          embedding = await generateLocalEmbedding(textToEmbed);
        }

        // Update memory with embedding
        await Memory.findByIdAndUpdate(memory._id, {
          embedding,
          embeddingModel: embeddingMethod,
          embeddingGeneratedAt: new Date(),
        });

        processed++;

        // Log progress every 10 memories
        if (processed % 10 === 0) {
          console.log(`Progress: ${processed}/${memories.length}`);
        }

        // Rate limiting for OpenAI
        if (embeddingMethod === 'openai') {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Failed to generate embedding for memory ${memory._id}:`, error.message);
        failed++;
      }
    }

    console.log(`✅ Batch complete: ${processed} processed, ${failed} failed`);

    res.status(200).json({
      success: true,
      message: 'Embeddings generated successfully',
      method: embeddingMethod,
      processed,
      failed,
      total: memories.length,
    });
  } catch (error) {
    console.error('Error in batch embedding generation:', error);
    res.status(500).json({
      success: false,
      message: 'Batch embedding generation failed',
      error: error.message,
    });
  }
};

// @desc    Get embedding statistics
// @route   GET /api/memories/embedding-stats
// @access  Public
export const getEmbeddingStatistics = async (req, res) => {
  try {
    const stats = await getEmbeddingStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting embedding stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message,
    });
  }
};

// @desc    Update search settings (API key, method)
// @route   POST /api/memories/search-settings
// @access  Public
export const updateSearchSettings = async (req, res) => {
  try {
    const { openaiApiKey, searchMethod } = req.body;

    // Configure OpenAI if API key provided
    if (openaiApiKey) {
      const { configureOpenAI, testOpenAIKey } = await import('../services/openaiEmbedding.js');

      // Test the key first
      const isValid = await testOpenAIKey(openaiApiKey);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OpenAI API key',
        });
      }

      // Configure
      configureOpenAI(openaiApiKey);

      console.log('✅ OpenAI API key configured successfully');
    }

    res.status(200).json({
      success: true,
      message: 'Search settings updated successfully',
      openaiConfigured: isOpenAIConfigured(),
      localModelReady: isLocalModelReady(),
    });
  } catch (error) {
    console.error('Error updating search settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
};
