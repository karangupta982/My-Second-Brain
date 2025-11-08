import Memory from '../models/Memory.js';

// @desc    Save a new memory
// @route   POST /api/memories/save
// @access  Public (will be protected later with auth)
export const saveMemory = async (req, res) => {
  try {
    const { text, url, title, context, tags } = req.body;

    // Validate required fields
    if (!text || !url || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text, url, and title',
      });
    }

    const memory = await Memory.create({
      text,
      url,
      title,
      metadata: {
        context: context || '',
      },
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      data: memory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get all memories
// @route   GET /api/memories/all
// @access  Public (will be protected later with auth)
export const getAllMemories = async (req, res) => {
  try {
    const memories = await Memory.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: memories.length,
      data: memories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Search memories
// @route   GET /api/memories/search?query=keyword
// @access  Public (will be protected later with auth)
export const searchMemories = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query',
      });
    }

    // Use MongoDB text search
    const memories = await Memory.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      count: memories.length,
      data: memories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Delete a memory
// @route   DELETE /api/memories/:id
// @access  Public (will be protected later with auth)
export const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    await memory.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
