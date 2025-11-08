const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Save a new memory
export const saveMemory = async (memoryData) => {
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
};

// Get all memories
export const getAllMemories = async () => {
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
};

// Search memories
export const searchMemories = async (query) => {
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
};

// Delete a memory
export const deleteMemory = async (id) => {
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
};
