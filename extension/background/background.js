// Background Service Worker for Project Synapse

const API_BASE_URL = 'http://localhost:5000/api';

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveToSynapse',
    title: 'Save to Synapse',
    contexts: ['selection'],
  });

  console.log('Project Synapse extension installed');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveToSynapse') {
    const selectedText = info.selectionText;

    // Send message to content script to get page info and save
    chrome.tabs.sendMessage(tab.id, {
      action: 'saveSelection',
      text: selectedText,
      url: tab.url,
      title: tab.title,
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveMemory') {
    saveMemoryToBackend(request.data)
      .then((response) => {
        sendResponse({ success: true, data: response });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'getAllMemories') {
    getAllMemories()
      .then((response) => {
        sendResponse({ success: true, data: response });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === 'searchMemories') {
    searchMemories(request.query)
      .then((response) => {
        sendResponse({ success: true, data: response });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === 'deleteMemory') {
    deleteMemory(request.id)
      .then((response) => {
        sendResponse({ success: true, data: response });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// API Functions
async function saveMemoryToBackend(memoryData) {
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
}

async function getAllMemories() {
  const response = await fetch(`${API_BASE_URL}/memories/all`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch memories');
  }

  return data;
}

async function searchMemories(query) {
  const response = await fetch(
    `${API_BASE_URL}/memories/search?query=${encodeURIComponent(query)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to search memories');
  }

  return data;
}

async function deleteMemory(id) {
  const response = await fetch(`${API_BASE_URL}/memories/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete memory');
  }

  return data;
}
