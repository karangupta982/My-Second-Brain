import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default-user', // For MVP, using default user. Will add auth later
    },
    text: {
      type: String,
      required: [true, 'Memory text is required'],
    },
    url: {
      type: String,
      required: [true, 'Source URL is required'],
    },
    title: {
      type: String,
      required: [true, 'Page title is required'],
    },
    metadata: {
      context: {
        type: String,
        default: '',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    imagePath: {
      type: String, // Local file path to image (e.g., "/images/1699123456789.jpg")
      default: null,
    },
    // Semantic Search Fields
    embedding: {
      type: [Number], // Vector embedding (384 for local, 1536 for OpenAI)
      default: null,
    },
    embeddingModel: {
      type: String, // "local" or "openai"
      default: null,
    },
    embeddingGeneratedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Add text index for search functionality
memorySchema.index({ text: 'text', title: 'text', 'metadata.context': 'text' });

const Memory = mongoose.model('Memory', memorySchema);

export default Memory;
