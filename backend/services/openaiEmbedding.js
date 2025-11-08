import OpenAI from 'openai';

// OpenAI Embedding Service
// Generates embeddings using OpenAI's API if user has API key

let openaiClient = null;
let isConfigured = false;

/**
 * Configure OpenAI client with API key
 * @param {string} apiKey - OpenAI API key from user settings
 */
export function configureOpenAI(apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    isConfigured = false;
    openaiClient = null;
    return false;
  }

  try {
    openaiClient = new OpenAI({
      apiKey: apiKey.trim(),
    });
    isConfigured = true;
    console.log('OpenAI API configured successfully');
    return true;
  } catch (error) {
    console.error('Failed to configure OpenAI:', error.message);
    isConfigured = false;
    openaiClient = null;
    return false;
  }
}

/**
 * Check if OpenAI is configured
 * @returns {boolean}
 */
export function isOpenAIConfigured() {
  return isConfigured && openaiClient !== null;
}

/**
 * Generate embedding using OpenAI API
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} - Embedding vector (1536 dimensions)
 */
export async function generateOpenAIEmbedding(text) {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI is not configured. Please provide an API key.');
  }

  if (!text || text.trim() === '') {
    throw new Error('Text is required to generate embedding');
  }

  try {
    // Use the latest small embedding model (cheaper and faster)
    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.trim(),
      encoding_format: 'float',
    });

    if (!response.data || !response.data[0] || !response.data[0].embedding) {
      throw new Error('Invalid response from OpenAI API');
    }

    // Returns array of 1536 floats
    return response.data[0].embedding;
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key');
    } else if (error.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('OpenAI service error. Please try again later.');
    } else {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 * @param {string[]} texts - Array of texts
 * @param {function} progressCallback - Optional callback for progress updates
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function generateOpenAIEmbeddingsBatch(texts, progressCallback = null) {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI is not configured. Please provide an API key.');
  }

  if (!texts || texts.length === 0) {
    return [];
  }

  const embeddings = [];
  const batchSize = 20; // OpenAI allows batching up to 2048 inputs

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    try {
      const response = await openaiClient.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
        encoding_format: 'float',
      });

      // Add embeddings from this batch
      for (const item of response.data) {
        embeddings.push(item.embedding);
      }

      // Report progress
      if (progressCallback) {
        progressCallback({
          processed: Math.min(i + batchSize, texts.length),
          total: texts.length,
          percentage: Math.round((Math.min(i + batchSize, texts.length) / texts.length) * 100),
        });
      }

      // Rate limiting: wait 100ms between batches
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error processing batch ${i / batchSize + 1}:`, error.message);
      throw error;
    }
  }

  return embeddings;
}

/**
 * Estimate cost for generating embeddings
 * @param {number} tokenCount - Number of tokens
 * @returns {number} - Estimated cost in USD
 */
export function estimateOpenAICost(tokenCount) {
  // text-embedding-3-small: $0.00002 / 1K tokens
  const costPerThousand = 0.00002;
  return (tokenCount / 1000) * costPerThousand;
}

/**
 * Test OpenAI API key validity
 * @param {string} apiKey - API key to test
 * @returns {Promise<boolean>} - True if valid
 */
export async function testOpenAIKey(apiKey) {
  try {
    const testClient = new OpenAI({ apiKey: apiKey.trim() });

    // Try to generate a simple embedding
    await testClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test',
      encoding_format: 'float',
    });

    return true;
  } catch (error) {
    console.error('OpenAI API key test failed:', error.message);
    return false;
  }
}
