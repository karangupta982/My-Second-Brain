import { pipeline } from '@xenova/transformers';

// Local Embedding Service
// Uses Transformers.js to generate embeddings locally (no API key needed!)
// Model: all-MiniLM-L6-v2 (384 dimensions, fast, good quality)

let embedder = null;
let isLoading = false;
let loadError = null;

/**
 * Initialize the local embedding model
 * Downloads model on first use (cached afterwards)
 * @returns {Promise<void>}
 */
async function initializeEmbedder() {
  if (embedder) {
    return; // Already initialized
  }

  if (isLoading) {
    // Wait for ongoing initialization
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }

  try {
    isLoading = true;
    console.log('Loading local embedding model (all-MiniLM-L6-v2)...');
    console.log('First time will download ~23MB, then cached locally');

    // Use feature-extraction pipeline with all-MiniLM-L6-v2
    // This is a popular sentence embedding model
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    console.log('Local embedding model loaded successfully!');
    loadError = null;
  } catch (error) {
    console.error('Failed to load local embedding model:', error);
    loadError = error.message;
    embedder = null;
  } finally {
    isLoading = false;
  }
}

/**
 * Mean pooling - average token embeddings
 * @param {Object} output - Model output
 * @param {Object} attention_mask - Attention mask
 * @returns {Array} - Pooled embedding
 */
function meanPooling(output, attention_mask) {
  const embeddings = output.data;
  const [batchSize, seqLength, hiddenSize] = output.dims;

  // Sum embeddings weighted by attention mask
  const pooled = new Array(hiddenSize).fill(0);

  for (let i = 0; i < seqLength; i++) {
    const mask = attention_mask.data[i];
    for (let j = 0; j < hiddenSize; j++) {
      pooled[j] += embeddings[i * hiddenSize + j] * mask;
    }
  }

  // Normalize by sum of attention mask
  const sumMask = attention_mask.data.reduce((a, b) => a + b, 0);
  for (let j = 0; j < hiddenSize; j++) {
    pooled[j] /= sumMask;
  }

  return pooled;
}

/**
 * Normalize vector to unit length
 * @param {Array} vector - Input vector
 * @returns {Array} - Normalized vector
 */
function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

/**
 * Generate embedding using local model
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} - Embedding vector (384 dimensions)
 */
export async function generateLocalEmbedding(text) {
  if (!text || text.trim() === '') {
    throw new Error('Text is required to generate embedding');
  }

  try {
    // Initialize model if needed
    await initializeEmbedder();

    if (!embedder) {
      throw new Error(`Local embedding model failed to load: ${loadError || 'Unknown error'}`);
    }

    // Generate embedding
    const output = await embedder(text.trim(), {
      pooling: 'mean',
      normalize: true,
    });

    // Convert to regular array
    const embedding = Array.from(output.data);

    // Returns array of 384 floats
    return embedding;
  } catch (error) {
    console.error('Error generating local embedding:', error);
    throw new Error(`Failed to generate local embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 * @param {string[]} texts - Array of texts
 * @param {function} progressCallback - Optional callback for progress updates
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function generateLocalEmbeddingsBatch(texts, progressCallback = null) {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Initialize model once
  await initializeEmbedder();

  if (!embedder) {
    throw new Error(`Local embedding model failed to load: ${loadError || 'Unknown error'}`);
  }

  const embeddings = [];

  for (let i = 0; i < texts.length; i++) {
    try {
      const embedding = await generateLocalEmbedding(texts[i]);
      embeddings.push(embedding);

      // Report progress
      if (progressCallback) {
        progressCallback({
          processed: i + 1,
          total: texts.length,
          percentage: Math.round(((i + 1) / texts.length) * 100),
        });
      }
    } catch (error) {
      console.error(`Error processing text ${i + 1}:`, error.message);
      // Push null for failed embeddings
      embeddings.push(null);
    }
  }

  return embeddings;
}

/**
 * Check if local model is ready
 * @returns {boolean}
 */
export function isLocalModelReady() {
  return embedder !== null;
}

/**
 * Get model loading status
 * @returns {Object} - Status object
 */
export function getLocalModelStatus() {
  return {
    ready: embedder !== null,
    loading: isLoading,
    error: loadError,
  };
}

/**
 * Preload the local model (call on server startup)
 * @returns {Promise<void>}
 */
export async function preloadLocalModel() {
  console.log('Preloading local embedding model...');
  await initializeEmbedder();
}
