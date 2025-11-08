// Background Service Worker for Project Synapse

let API_BASE_URL = 'http://localhost:5000/api';
let settings = {
  apiUrl: 'http://localhost:5000/api',
  enableNotifications: true,
  enableOffline: true,
  autoTagging: true,
  theme: 'light'
};

// Load settings on startup
chrome.storage.sync.get(['settings'], (result) => {
  if (result.settings) {
    settings = result.settings;
    API_BASE_URL = settings.apiUrl;
  }
});

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveToSynapse',
    title: 'Save to Synapse',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'captureImage',
    title: 'Capture Image to Synapse',
    contexts: ['image'],
  });

  console.log('Project Synapse extension installed');

  // Initialize default settings if not exists
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({ settings });
    }
  });
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
    }).catch((error) => {
      console.log('Content script not ready on this page');
    });
  }

  if (info.menuItemId === 'captureImage') {
    const imageUrl = info.srcUrl;

    // Send message to content script to save image
    chrome.tabs.sendMessage(tab.id, {
      action: 'saveImage',
      imageUrl: imageUrl,
      pageUrl: tab.url,
      pageTitle: tab.title,
    }).catch((error) => {
      console.log('Content script not ready on this page');
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveMemory') {
    saveMemoryWithOfflineFallback(request.data)
      .then((response) => {
        sendResponse({ success: true, data: response });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'getAllMemories') {
    getAllMemoriesWithCache()
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

  if (request.action === 'settingsUpdated') {
    settings = request.settings;
    API_BASE_URL = settings.apiUrl;
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'generateTags') {
    generateTags(request.text)
      .then((tags) => {
        sendResponse({ success: true, tags });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === 'getRelatedMemories') {
    getMemoriesByUrl(request.url)
      .then((response) => {
        sendResponse({ success: true, data: response.data });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === 'semanticSearch') {
    semanticSearch(request.query, request.searchMethod)
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

async function getMemoriesByUrl(url) {
  const response = await fetch(
    `${API_BASE_URL}/memories/by-url?url=${encodeURIComponent(url)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get memories by URL');
  }

  return data;
}

async function semanticSearch(query, searchMethod = 'auto') {
  const response = await fetch(`${API_BASE_URL}/memories/semantic-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      searchMethod,
      useHybrid: false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to perform semantic search');
  }

  return data;
}

// Save memory with offline fallback
async function saveMemoryWithOfflineFallback(memoryData) {
  // Add auto-generated tags if enabled
  if (settings.autoTagging && memoryData.tags.length === 0) {
    try {
      const tags = await generateTags(memoryData.text + ' ' + memoryData.title);
      memoryData.tags = tags;
    } catch (err) {
      console.log('Auto-tagging failed:', err);
    }
  }

  try {
    // Try to save to backend first
    const response = await saveMemoryToBackend(memoryData);
    return response;
  } catch (error) {
    // If backend fails and offline mode is enabled, save locally
    if (settings.enableOffline) {
      console.log('Backend unavailable, saving offline:', error.message);
      return await saveMemoryOffline(memoryData);
    } else {
      throw error;
    }
  }
}

// Save memory to local storage (offline mode)
async function saveMemoryOffline(memoryData) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['offlineMemories'], (result) => {
      const offlineMemories = result.offlineMemories || [];

      // Add timestamp and unique ID
      const memory = {
        ...memoryData,
        _id: 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        offline: true
      };

      offlineMemories.push(memory);

      chrome.storage.local.set({ offlineMemories }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error('Failed to save offline'));
        } else {
          resolve({ success: true, data: memory, offline: true });
        }
      });
    });
  });
}

// Get all memories with cache
async function getAllMemoriesWithCache() {
  try {
    // Try to get from backend
    const response = await getAllMemories();

    // Cache the results
    chrome.storage.local.set({
      memories: response.data,
      lastSync: Date.now()
    });

    // Merge with offline memories
    const offlineMemories = await getOfflineMemories();
    const allMemories = [...response.data, ...offlineMemories];

    return { ...response, data: allMemories };
  } catch (error) {
    // If backend fails, return cached + offline memories
    console.log('Backend unavailable, using cache:', error.message);
    const cachedMemories = await getCachedMemories();
    const offlineMemories = await getOfflineMemories();
    const allMemories = [...cachedMemories, ...offlineMemories];

    return { success: true, data: allMemories, cached: true };
  }
}

// Get offline memories from storage
function getOfflineMemories() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['offlineMemories'], (result) => {
      resolve(result.offlineMemories || []);
    });
  });
}

// Get cached memories
function getCachedMemories() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['memories'], (result) => {
      resolve(result.memories || []);
    });
  });
}

// Auto-generate tags from text
async function generateTags(text) {
  // Simple keyword extraction (in production, you'd use NLP/AI)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4); // Words longer than 4 chars

  // Common programming/tech keywords
  const techKeywords = [
    'javascript', 'python', 'react', 'node', 'database', 'api', 'frontend',
    'backend', 'design', 'algorithm', 'data', 'security', 'cloud', 'docker',
    'kubernetes', 'machine', 'learning', 'artificial', 'intelligence',
    'productivity', 'tutorial', 'guide', 'documentation', 'code', 'development'
  ];

  // Find matching keywords
  const tags = [];
  const uniqueWords = [...new Set(words)];

  for (const word of uniqueWords) {
    if (techKeywords.includes(word) && tags.length < 5) {
      tags.push(word);
    }
  }

  // Add general categories based on content
  if (text.match(/function|class|const|let|var|import|export/i)) {
    tags.push('programming');
  }
  if (text.match(/tutorial|guide|how to|learn/i)) {
    tags.push('tutorial');
  }
  if (text.match(/article|blog|post/i)) {
    tags.push('article');
  }

  return [...new Set(tags)].slice(0, 5);
}

// Keyboard shortcuts handler
chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-selection') {
    // Get active tab and execute save
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'saveCurrentSelection'
        }).catch((error) => {
          console.log('Content script not ready:', error);
        });
      }
    });
  }

  if (command === 'open-quick-notes') {
    // Open quick notes in a new window
    chrome.windows.create({
      url: 'quick-notes.html',
      type: 'popup',
      width: 400,
      height: 500
    }).catch((error) => {
      console.log('Failed to open quick notes:', error);
    });
  }
});

// Periodically sync offline memories when online
setInterval(async () => {
  if (settings.enableOffline) {
    try {
      const offlineMemories = await getOfflineMemories();

      if (offlineMemories.length > 0) {
        console.log(`Auto-syncing ${offlineMemories.length} offline memories...`);

        const successfulSyncs = [];

        for (const memory of offlineMemories) {
          try {
            const { _id, createdAt, offline, ...memoryData } = memory;
            await saveMemoryToBackend(memoryData);
            successfulSyncs.push(memory._id);
          } catch (err) {
            // Backend still offline, will try again later
            console.log('Sync failed for memory:', err.message || err);
          }
        }

        // Remove successfully synced memories from offline storage
        if (successfulSyncs.length > 0) {
          const remainingOffline = offlineMemories.filter(
            m => !successfulSyncs.includes(m._id)
          );
          chrome.storage.local.set({ offlineMemories: remainingOffline });
          console.log(`Synced ${successfulSyncs.length} memories successfully`);
        }
      }
    } catch (err) {
      // Silently fail - this is background sync, don't spam console
      if (err.message && !err.message.includes('Could not establish connection')) {
        console.log('Auto-sync error:', err.message || err);
      }
    }
  }
}, 60000); // Check every minute

// Handle extension reload/install - clear any broken message channels
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension reloaded - clearing any broken connections');
});
