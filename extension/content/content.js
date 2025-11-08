// Content Script for Project Synapse
// Runs on every webpage to handle text selection and saving

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveSelection') {
    // Show save modal instead of immediately saving
    showSaveModal({
      text: request.text,
      url: request.url,
      title: request.title,
    });
  }

  if (request.action === 'saveCurrentSelection') {
    const selectedText = window.getSelection().toString().trim();

    if (!selectedText) {
      showNotification('Please select some text first', 'error');
      return;
    }

    // Show save modal with the selected text
    showSaveModal({
      text: selectedText,
      url: window.location.href,
      title: document.title,
    });
  }

  if (request.action === 'saveImage') {
    // Convert image to base64 and save
    captureImageAsBase64(request.imageUrl, request.pageUrl, request.pageTitle);
  }
});

// Show notification to user
function showNotification(message, type = 'success') {
  // Remove existing notification if any
  const existingNotification = document.getElementById('synapse-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'synapse-notification';
  notification.className = `synapse-notification synapse-notification-${type}`;
  notification.innerHTML = `
    <div class="synapse-notification-content">
      <svg class="synapse-notification-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        ${
          type === 'success'
            ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />'
            : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />'
        }
      </svg>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Fade in
  setTimeout(() => {
    notification.classList.add('synapse-notification-show');
  }, 10);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('synapse-notification-show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Capture image as base64 data URL
async function captureImageAsBase64(imageUrl, pageUrl, pageTitle) {
  try {
    showNotification('Capturing image...', 'success');

    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = function() {
      const base64data = reader.result;

      // Get image dimensions and other info
      const img = new Image();
      img.onload = function() {
        const memoryData = {
          text: `Image captured from: ${pageTitle}`,
          url: pageUrl, // Store page URL, not image URL
          title: `Image from ${new URL(pageUrl).hostname}`,
          context: `Original URL: ${imageUrl}\nDimensions: ${img.width}x${img.height}`,
          tags: ['image', 'screenshot'],
          imageData: base64data, // Store the actual image as base64
        };

        chrome.runtime.sendMessage(
          {
            action: 'saveMemory',
            data: memoryData,
          },
          (response) => {
            if (response && response.success) {
              showNotification('Image captured and saved!', 'success');
            } else {
              showNotification('Failed to save image', 'error');
            }
          }
        );
      };
      img.src = base64data;
    };
    reader.onerror = function() {
      showNotification('Failed to process image', 'error');
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error('Error capturing image:', error);

    // Fallback: Save just the reference if fetch fails (CORS issues, etc.)
    const memoryData = {
      text: `Image from: ${pageTitle}`,
      url: imageUrl, // Keep the original URL as fallback
      title: 'Image Reference',
      context: `Source page: ${pageUrl}\nNote: Could not capture image data directly (may be protected). URL saved as reference.`,
      tags: ['image', 'reference'],
    };

    chrome.runtime.sendMessage(
      {
        action: 'saveMemory',
        data: memoryData,
      },
      (response) => {
        if (response && response.success) {
          showNotification('Image reference saved (direct capture failed)', 'success');
        } else {
          showNotification('Failed to save image', 'error');
        }
      }
    );
  }
}

// ============================================
// CONTEXT-AWARE BROWSING
// ============================================

let relatedMemories = [];
let floatingIcon = null;
let memoryPanel = null;
let memoryModal = null;

// Check for related memories when page loads
function checkForRelatedMemories() {
  const currentUrl = window.location.href;

  // Ask background script to fetch related memories
  chrome.runtime.sendMessage(
    {
      action: 'getRelatedMemories',
      url: currentUrl,
    },
    (response) => {
      if (response && response.success && response.data.length > 0) {
        relatedMemories = response.data;
        showFloatingIcon();
      }
    }
  );
}

// Create and show floating Synapse icon
function showFloatingIcon() {
  // Don't create if already exists
  if (floatingIcon) {
    floatingIcon.style.display = 'flex';
    return;
  }

  floatingIcon = document.createElement('div');
  floatingIcon.id = 'synapse-floating-icon';
  floatingIcon.className = 'synapse-floating-icon';
  floatingIcon.innerHTML = `
    <div class="synapse-icon-content">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span class="synapse-badge">${relatedMemories.length}</span>
    </div>
  `;

  floatingIcon.title = `${relatedMemories.length} saved ${relatedMemories.length === 1 ? 'memory' : 'memories'} from this site`;

  floatingIcon.addEventListener('click', toggleMemoryPanel);
  document.body.appendChild(floatingIcon);

  // Animate in
  setTimeout(() => {
    floatingIcon.classList.add('synapse-icon-visible');
  }, 100);
}

// Toggle memory panel
function toggleMemoryPanel() {
  if (memoryPanel && memoryPanel.classList.contains('synapse-panel-visible')) {
    hideMemoryPanel();
  } else {
    showMemoryPanel();
  }
}

// Show memory panel with related memories
function showMemoryPanel() {
  // Remove existing panel if any
  if (memoryPanel) {
    memoryPanel.remove();
  }

  memoryPanel = document.createElement('div');
  memoryPanel.id = 'synapse-memory-panel';
  memoryPanel.className = 'synapse-memory-panel';

  memoryPanel.innerHTML = `
    <div class="synapse-panel-header">
      <h3>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
        </svg>
        Saved Memories (${relatedMemories.length})
      </h3>
      <button class="synapse-panel-close" id="synapse-close-panel">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
    <div class="synapse-panel-content" id="synapse-panel-content">
      ${renderMemoryList()}
    </div>
  `;

  document.body.appendChild(memoryPanel);

  // Event listeners
  document.getElementById('synapse-close-panel').addEventListener('click', hideMemoryPanel);

  // Add click listeners to memory cards
  memoryPanel.querySelectorAll('.synapse-memory-item').forEach((item, index) => {
    item.addEventListener('click', () => showMemoryDetail(relatedMemories[index]));
  });

  // Animate in
  setTimeout(() => {
    memoryPanel.classList.add('synapse-panel-visible');
  }, 10);
}

// Hide memory panel
function hideMemoryPanel() {
  if (memoryPanel) {
    memoryPanel.classList.remove('synapse-panel-visible');
    setTimeout(() => {
      if (memoryPanel) {
        memoryPanel.remove();
        memoryPanel = null;
      }
    }, 300);
  }
}

// Render memory list
function renderMemoryList() {
  return relatedMemories.map((memory, index) => {
    const date = new Date(memory.createdAt);
    const dateStr = formatDate(date);
    const preview = memory.text.length > 100 ? memory.text.substring(0, 100) + '...' : memory.text;

    return `
      <div class="synapse-memory-item" data-index="${index}">
        ${memory.imagePath ? `
          <div class="synapse-memory-image">
            <img src="http://localhost:5000${memory.imagePath}" alt="${escapeHtml(memory.title)}">
          </div>
        ` : ''}
        <div class="synapse-memory-info">
          <h4>${escapeHtml(memory.title)}</h4>
          <p class="synapse-memory-preview">${escapeHtml(preview)}</p>
          <div class="synapse-memory-meta">
            ${memory.tags && memory.tags.length > 0 ? `
              <div class="synapse-memory-tags">
                ${memory.tags.slice(0, 3).map(tag => `<span class="synapse-tag">${escapeHtml(tag)}</span>`).join('')}
              </div>
            ` : ''}
            <span class="synapse-memory-date">${dateStr}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Show memory detail modal
function showMemoryDetail(memory) {
  // Remove existing modal if any
  if (memoryModal) {
    memoryModal.remove();
  }

  memoryModal = document.createElement('div');
  memoryModal.id = 'synapse-memory-modal';
  memoryModal.className = 'synapse-memory-modal';

  const date = new Date(memory.createdAt);
  const dateStr = formatDate(date);

  memoryModal.innerHTML = `
    <div class="synapse-modal-overlay"></div>
    <div class="synapse-modal-content">
      <div class="synapse-modal-header">
        <h3>${escapeHtml(memory.title)}</h3>
        <button class="synapse-modal-close" id="synapse-close-modal">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <div class="synapse-modal-body">
        ${memory.imagePath ? `
          <div class="synapse-modal-image">
            <img src="http://localhost:5000${memory.imagePath}" alt="${escapeHtml(memory.title)}">
          </div>
        ` : ''}
        <div class="synapse-modal-text">
          ${escapeHtml(memory.text)}
        </div>
        ${memory.metadata?.context ? `
          <div class="synapse-modal-context">
            <strong>Context:</strong> ${escapeHtml(memory.metadata.context)}
          </div>
        ` : ''}
        ${memory.tags && memory.tags.length > 0 ? `
          <div class="synapse-modal-tags">
            ${memory.tags.map(tag => `<span class="synapse-tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
        <div class="synapse-modal-meta">
          <span>Saved on ${dateStr}</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(memoryModal);

  // Event listeners
  document.getElementById('synapse-close-modal').addEventListener('click', hideMemoryModal);
  memoryModal.querySelector('.synapse-modal-overlay').addEventListener('click', hideMemoryModal);

  // Animate in
  setTimeout(() => {
    memoryModal.classList.add('synapse-modal-visible');
  }, 10);
}

// Hide memory modal
function hideMemoryModal() {
  if (memoryModal) {
    memoryModal.classList.remove('synapse-modal-visible');
    setTimeout(() => {
      if (memoryModal) {
        memoryModal.remove();
        memoryModal = null;
      }
    }, 300);
  }
}

// ============================================
// SAVE MODAL
// ============================================

let saveModal = null;

// Show save modal for new memory
function showSaveModal(data) {
  // Remove existing modal if any
  if (saveModal) {
    saveModal.remove();
  }

  saveModal = document.createElement('div');
  saveModal.id = 'synapse-save-modal';
  saveModal.className = 'synapse-memory-modal';

  const textPreview = data.text.length > 200 ? data.text.substring(0, 200) + '...' : data.text;

  saveModal.innerHTML = `
    <div class="synapse-modal-overlay"></div>
    <div class="synapse-modal-content">
      <div class="synapse-modal-header">
        <h3>Save to Synapse</h3>
        <button class="synapse-modal-close" id="synapse-close-save-modal">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <div class="synapse-modal-body">
        <div class="synapse-save-form">
          <div class="synapse-form-group">
            <label for="synapse-save-title">Title</label>
            <input
              type="text"
              id="synapse-save-title"
              class="synapse-input"
              value="${escapeHtml(data.title)}"
              placeholder="Enter a title..."
            />
          </div>

          <div class="synapse-form-group">
            <label for="synapse-save-text">Selected Text</label>
            <textarea
              id="synapse-save-text"
              class="synapse-textarea"
              rows="6"
              placeholder="Your selected text..."
            >${escapeHtml(data.text)}</textarea>
          </div>

          <div class="synapse-form-group">
            <label for="synapse-save-context">Notes (Optional)</label>
            <textarea
              id="synapse-save-context"
              class="synapse-textarea"
              rows="3"
              placeholder="Add any additional notes or context..."
            ></textarea>
          </div>

          <div class="synapse-form-group">
            <label for="synapse-save-tags">Tags (Optional)</label>
            <input
              type="text"
              id="synapse-save-tags"
              class="synapse-input"
              placeholder="Separate tags with commas (e.g., javascript, tutorial, react)"
            />
          </div>

          <div class="synapse-form-meta">
            <small>Source: ${escapeHtml(data.url)}</small>
          </div>

          <div class="synapse-form-actions">
            <button class="synapse-btn synapse-btn-secondary" id="synapse-cancel-save">
              Cancel
            </button>
            <button class="synapse-btn synapse-btn-primary" id="synapse-confirm-save">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Save Memory
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(saveModal);

  // Store the original data
  saveModal.dataset.url = data.url;

  // Event listeners
  document.getElementById('synapse-close-save-modal').addEventListener('click', hideSaveModal);
  document.getElementById('synapse-cancel-save').addEventListener('click', hideSaveModal);
  saveModal.querySelector('.synapse-modal-overlay').addEventListener('click', hideSaveModal);
  document.getElementById('synapse-confirm-save').addEventListener('click', handleSaveConfirm);

  // Focus on title input
  setTimeout(() => {
    document.getElementById('synapse-save-title').focus();
    document.getElementById('synapse-save-title').select();
  }, 100);

  // Animate in
  setTimeout(() => {
    saveModal.classList.add('synapse-modal-visible');
  }, 10);
}

// Hide save modal
function hideSaveModal() {
  if (saveModal) {
    saveModal.classList.remove('synapse-modal-visible');
    setTimeout(() => {
      if (saveModal) {
        saveModal.remove();
        saveModal = null;
      }
    }, 300);
  }
}

// Handle save confirmation
function handleSaveConfirm() {
  const title = document.getElementById('synapse-save-title').value.trim();
  const text = document.getElementById('synapse-save-text').value.trim();
  const context = document.getElementById('synapse-save-context').value.trim();
  const tagsInput = document.getElementById('synapse-save-tags').value.trim();
  const url = saveModal.dataset.url;

  // Validate
  if (!title || !text) {
    showNotification('Please enter both title and text', 'error');
    return;
  }

  // Parse tags
  const tags = tagsInput
    ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];

  // Create memory data
  const memoryData = {
    title,
    text,
    url,
    context,
    tags,
  };

  // Disable save button and show loading
  const saveBtn = document.getElementById('synapse-confirm-save');
  const originalHTML = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = 'Saving...';

  // Send to background script to save
  chrome.runtime.sendMessage(
    {
      action: 'saveMemory',
      data: memoryData,
    },
    (response) => {
      if (response && response.success) {
        const message = response.data.offline
          ? 'Memory saved offline (will sync when online)'
          : 'Memory saved successfully!';
        showNotification(message, 'success');
        hideSaveModal();
      } else {
        showNotification('Failed to save memory', 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalHTML;
      }
    }
  );
}

// Format date
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize context-aware browsing
setTimeout(() => {
  checkForRelatedMemories();
}, 1000); // Wait 1 second after page load

console.log('Project Synapse content script loaded');
