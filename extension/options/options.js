// Options Page Script for Project Synapse

// Default settings
const DEFAULT_SETTINGS = {
  apiUrl: 'http://localhost:5000/api',
  enableNotifications: true,
  enableOffline: true,
  autoTagging: true,
  theme: 'light'
};

// DOM Elements
const apiUrlInput = document.getElementById('api-url');
const enableNotificationsCheckbox = document.getElementById('enable-notifications');
const enableOfflineCheckbox = document.getElementById('enable-offline');
const autoTaggingCheckbox = document.getElementById('auto-tagging');
const themeSelect = document.getElementById('theme');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const resetBtn = document.getElementById('reset-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const syncBtn = document.getElementById('sync-btn');
const clearCacheBtn = document.getElementById('clear-cache-btn');
const messageDiv = document.getElementById('message');
const storageUsed = document.getElementById('storage-used');
const storageText = document.getElementById('storage-text');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  updateStorageInfo();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  saveSettingsBtn.addEventListener('click', saveSettings);
  resetBtn.addEventListener('click', resetToDefaults);
  exportBtn.addEventListener('click', exportData);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', importData);
  syncBtn.addEventListener('click', syncOfflineData);
  clearCacheBtn.addEventListener('click', clearCache);
}

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || DEFAULT_SETTINGS;

    apiUrlInput.value = settings.apiUrl;
    enableNotificationsCheckbox.checked = settings.enableNotifications;
    enableOfflineCheckbox.checked = settings.enableOffline;
    autoTaggingCheckbox.checked = settings.autoTagging;
    themeSelect.value = settings.theme;

    applyTheme(settings.theme);
  });
}

// Save settings
function saveSettings() {
  const settings = {
    apiUrl: apiUrlInput.value.trim() || DEFAULT_SETTINGS.apiUrl,
    enableNotifications: enableNotificationsCheckbox.checked,
    enableOffline: enableOfflineCheckbox.checked,
    autoTagging: autoTaggingCheckbox.checked,
    theme: themeSelect.value
  };

  chrome.storage.sync.set({ settings }, () => {
    showMessage('Settings saved successfully!', 'success');
    applyTheme(settings.theme);

    // Notify background script of settings update
    chrome.runtime.sendMessage({
      action: 'settingsUpdated',
      settings
    });
  });
}

// Reset to defaults
function resetToDefaults() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    chrome.storage.sync.set({ settings: DEFAULT_SETTINGS }, () => {
      loadSettings();
      showMessage('Settings reset to defaults', 'success');
    });
  }
}

// Apply theme
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else if (theme === 'light') {
    document.body.classList.remove('dark-theme');
  } else {
    // Auto mode - check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}

// Export all data
async function exportData() {
  try {
    showMessage('Exporting data...', 'success');

    // Get all memories from local storage
    chrome.storage.local.get(['offlineMemories', 'memories'], async (result) => {
      const offlineMemories = result.offlineMemories || [];
      const cachedMemories = result.memories || [];

      // Also try to get from backend
      let backendMemories = [];
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getAllMemories' });
        if (response && response.success) {
          backendMemories = response.data.data || [];
        }
      } catch (err) {
        console.log('Could not fetch from backend:', err);
      }

      // Combine all memories and remove duplicates
      const allMemories = [...backendMemories, ...cachedMemories, ...offlineMemories];
      const uniqueMemories = Array.from(
        new Map(allMemories.map(m => [m._id || m.id || JSON.stringify(m), m])).values()
      );

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        memoriesCount: uniqueMemories.length,
        memories: uniqueMemories
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synapse-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showMessage(`Exported ${uniqueMemories.length} memories successfully!`, 'success');
    });
  } catch (error) {
    showMessage('Export failed: ' + error.message, 'error');
  }
}

// Import data
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      if (!importedData.memories || !Array.isArray(importedData.memories)) {
        throw new Error('Invalid import file format');
      }

      const memories = importedData.memories;

      if (confirm(`Import ${memories.length} memories? This will add them to your collection.`)) {
        showMessage('Importing data...', 'success');

        // Save each memory to backend
        let successCount = 0;
        let failCount = 0;

        for (const memory of memories) {
          try {
            const response = await chrome.runtime.sendMessage({
              action: 'saveMemory',
              data: {
                text: memory.text,
                url: memory.url,
                title: memory.title,
                context: memory.metadata?.context || memory.context || '',
                tags: memory.tags || []
              }
            });

            if (response && response.success) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (err) {
            failCount++;
          }
        }

        showMessage(
          `Import complete! Success: ${successCount}, Failed: ${failCount}`,
          failCount > 0 ? 'error' : 'success'
        );

        updateStorageInfo();
      }
    } catch (error) {
      showMessage('Import failed: ' + error.message, 'error');
    }

    // Reset file input
    event.target.value = '';
  };

  reader.readAsText(file);
}

// Sync offline data to backend
async function syncOfflineData() {
  chrome.storage.local.get(['offlineMemories'], async (result) => {
    const offlineMemories = result.offlineMemories || [];

    if (offlineMemories.length === 0) {
      showMessage('No offline memories to sync', 'success');
      return;
    }

    if (!confirm(`Sync ${offlineMemories.length} offline memories to backend?`)) {
      return;
    }

    showMessage('Syncing offline data...', 'success');

    let successCount = 0;
    let failCount = 0;
    const remainingOffline = [];

    for (const memory of offlineMemories) {
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'saveMemory',
          data: memory
        });

        if (response && response.success) {
          successCount++;
        } else {
          failCount++;
          remainingOffline.push(memory);
        }
      } catch (err) {
        failCount++;
        remainingOffline.push(memory);
      }
    }

    // Update offline storage with remaining items
    chrome.storage.local.set({ offlineMemories: remainingOffline }, () => {
      showMessage(
        `Sync complete! Success: ${successCount}, Failed: ${failCount}`,
        failCount > 0 ? 'error' : 'success'
      );
      updateStorageInfo();
    });
  });
}

// Clear local cache
function clearCache() {
  if (confirm('Are you sure you want to clear all local cache? Offline memories will be kept.')) {
    chrome.storage.local.get(['offlineMemories'], (result) => {
      const offlineMemories = result.offlineMemories || [];

      // Clear all except offline memories
      chrome.storage.local.clear(() => {
        chrome.storage.local.set({ offlineMemories }, () => {
          showMessage('Cache cleared successfully!', 'success');
          updateStorageInfo();
        });
      });
    });
  }
}

// Update storage info
function updateStorageInfo() {
  chrome.storage.local.get(['offlineMemories', 'memories'], (result) => {
    const offlineMemories = result.offlineMemories || [];
    const cachedMemories = result.memories || [];
    const totalCount = offlineMemories.length + cachedMemories.length;

    // Update text
    storageText.textContent = `${totalCount} memories stored locally (${offlineMemories.length} offline)`;

    // Update progress bar (assuming max 1000 for demo)
    const percentage = Math.min((totalCount / 1000) * 100, 100);
    storageUsed.style.width = percentage + '%';
  });
}

// Show message
function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove('hidden');

  setTimeout(() => {
    messageDiv.classList.add('hidden');
  }, 5000);
}
