// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Save a new memory
async function saveMemory(memoryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/memories/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memoryData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save memory');
    }

    return data;
  } catch (error) {
    console.error('Error saving memory:', error);
    throw error;
  }
}

// Get all memories
async function getAllMemories() {
  try {
    const response = await fetch(`${API_BASE_URL}/memories/all`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch memories');
    }

    return data;
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
}

// Search memories
async function searchMemories(query) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/memories/search?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to search memories');
    }

    return data;
  } catch (error) {
    console.error('Error searching memories:', error);
    throw error;
  }
}

// Delete a memory
async function deleteMemory(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/memories/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete memory');
    }

    return data;
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { saveMemory, getAllMemories, searchMemories, deleteMemory };
}
