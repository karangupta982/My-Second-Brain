import Memory from '../models/Memory.js';

// Vector Search Service
// Performs similarity search using cosine similarity

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vectorA - First vector
 * @param {number[]} vectorB - Second vector
 * @returns {number} - Similarity score (0 to 1)
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (!vectorA || !vectorB) {
    return 0;
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  // Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }

  // Calculate magnitudes
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // Avoid division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Return similarity (0 to 1, where 1 is identical)
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Search memories by vector similarity
 * @param {number[]} queryEmbedding - Query embedding vector
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Array of memories with similarity scores
 */
export async function searchByEmbedding(queryEmbedding, options = {}) {
  const {
    limit = 50,
    threshold = 0.3, // Minimum similarity score
    dateFilter = null,
    type = null,
    domain = null,
    tags = [],
  } = options;

  try {
    // Find all memories that have embeddings
    const query = {
      embedding: { $exists: true, $ne: null },
    };

    // Apply filters
    if (dateFilter) {
      query.createdAt = {
        $gte: dateFilter.start,
        $lte: dateFilter.end,
      };
    }

    if (domain) {
      query.url = { $regex: domain, $options: 'i' };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Fetch memories
    const memories = await Memory.find(query).lean();

    if (memories.length === 0) {
      return [];
    }

    // Calculate similarity for each memory
    const results = memories.map((memory) => {
      const similarity = cosineSimilarity(queryEmbedding, memory.embedding);

      return {
        ...memory,
        similarity: Math.round(similarity * 100) / 100, // Round to 2 decimals
      };
    });

    // Filter by threshold
    const filtered = results.filter((result) => result.similarity >= threshold);

    // Sort by similarity (highest first)
    filtered.sort((a, b) => b.similarity - a.similarity);

    // Apply limit
    const limited = filtered.slice(0, limit);

    return limited;
  } catch (error) {
    console.error('Error in vector search:', error);
    throw error;
  }
}

/**
 * Find similar memories to a given memory
 * @param {string} memoryId - Memory ID to find similar memories for
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of similar memories
 */
export async function findSimilarMemories(memoryId, limit = 10) {
  try {
    // Get the source memory
    const sourceMemory = await Memory.findById(memoryId).lean();

    if (!sourceMemory || !sourceMemory.embedding) {
      throw new Error('Memory not found or has no embedding');
    }

    // Search for similar memories (excluding the source)
    const allMemories = await Memory.find({
      _id: { $ne: memoryId },
      embedding: { $exists: true, $ne: null },
    }).lean();

    // Calculate similarities
    const results = allMemories.map((memory) => {
      const similarity = cosineSimilarity(sourceMemory.embedding, memory.embedding);

      return {
        ...memory,
        similarity: Math.round(similarity * 100) / 100,
      };
    });

    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    // Return top results
    return results.slice(0, limit);
  } catch (error) {
    console.error('Error finding similar memories:', error);
    throw error;
  }
}

/**
 * Get embedding statistics
 * @returns {Promise<Object>} - Statistics object
 */
export async function getEmbeddingStats() {
  try {
    const totalMemories = await Memory.countDocuments();
    const memoriesWithEmbeddings = await Memory.countDocuments({
      embedding: { $exists: true, $ne: null },
    });

    const openAIEmbeddings = await Memory.countDocuments({
      embeddingModel: 'openai',
    });

    const localEmbeddings = await Memory.countDocuments({
      embeddingModel: 'local',
    });

    return {
      totalMemories,
      memoriesWithEmbeddings,
      memoriesWithoutEmbeddings: totalMemories - memoriesWithEmbeddings,
      openAIEmbeddings,
      localEmbeddings,
      coverage: totalMemories > 0
        ? Math.round((memoriesWithEmbeddings / totalMemories) * 100)
        : 0,
    };
  } catch (error) {
    console.error('Error getting embedding stats:', error);
    throw error;
  }
}

/**
 * Batch calculate similarities between query and multiple memories
 * Optimized for performance
 * @param {number[]} queryEmbedding - Query embedding
 * @param {Array} memories - Array of memory objects with embeddings
 * @returns {Array} - Memories with similarity scores
 */
export function batchCalculateSimilarities(queryEmbedding, memories) {
  return memories.map((memory) => {
    if (!memory.embedding) {
      return { ...memory, similarity: 0 };
    }

    const similarity = cosineSimilarity(queryEmbedding, memory.embedding);

    return {
      ...memory,
      similarity: Math.round(similarity * 100) / 100,
    };
  });
}

/**
 * Hybrid search: Combine vector search with keyword search
 * @param {number[]} queryEmbedding - Query embedding
 * @param {string} keywords - Keywords for text search
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Combined results
 */
export async function hybridSearch(queryEmbedding, keywords, options = {}) {
  const { limit = 50, vectorWeight = 0.7, keywordWeight = 0.3 } = options;

  try {
    // Vector search
    const vectorResults = await searchByEmbedding(queryEmbedding, {
      ...options,
      limit: limit * 2, // Get more for merging
    });

    // Keyword search
    const keywordResults = await Memory.find(
      { $text: { $search: keywords } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 2)
      .lean();

    // Combine scores
    const combinedMap = new Map();

    // Add vector results
    for (const result of vectorResults) {
      const id = result._id.toString();
      combinedMap.set(id, {
        ...result,
        vectorScore: result.similarity,
        keywordScore: 0,
        combinedScore: result.similarity * vectorWeight,
      });
    }

    // Add/merge keyword results
    for (const result of keywordResults) {
      const id = result._id.toString();
      const normalized = result.score / 10; // Normalize keyword score to 0-1

      if (combinedMap.has(id)) {
        const existing = combinedMap.get(id);
        existing.keywordScore = normalized;
        existing.combinedScore =
          existing.vectorScore * vectorWeight + normalized * keywordWeight;
      } else {
        combinedMap.set(id, {
          ...result,
          vectorScore: 0,
          keywordScore: normalized,
          combinedScore: normalized * keywordWeight,
          similarity: 0,
        });
      }
    }

    // Convert to array and sort by combined score
    const combined = Array.from(combinedMap.values());
    combined.sort((a, b) => b.combinedScore - a.combinedScore);

    // Return top results
    return combined.slice(0, limit);
  } catch (error) {
    console.error('Error in hybrid search:', error);
    throw error;
  }
}
