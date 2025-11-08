// Popup Script for Project Synapse

let allMemories = [];
let isSearching = false;

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const clearSearchBtn = document.getElementById('clear-search-btn');
const addMemoryBtn = document.getElementById('add-memory-btn');
const addForm = document.getElementById('add-form');
const saveMemoryBtn = document.getElementById('save-memory-btn');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const memoriesList = document.getElementById('memories-list');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const memoryCount = document.getElementById('memory-count');
const errorMessage = document.getElementById('error-message');
const openDashboard = document.getElementById('open-dashboard');

// Form inputs
const formTitle = document.getElementById('form-title');
const formText = document.getElementById('form-text');
const formUrl = document.getElementById('form-url');
const formContext = document.getElementById('form-context');
const formTags = document.getElementById('form-tags');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadMemories();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  clearSearchBtn.addEventListener('click', handleClearSearch);
  addMemoryBtn.addEventListener('click', showAddForm);
  cancelFormBtn.addEventListener('click', hideAddForm);
  saveMemoryBtn.addEventListener('click', handleSaveMemory);
  openDashboard.addEventListener('click', handleOpenDashboard);
}

// Load all memories
function loadMemories() {
  showLoading(true);
  hideError();

  chrome.runtime.sendMessage({ action: 'getAllMemories' }, (response) => {
    showLoading(false);

    if (response && response.success) {
      allMemories = response.data.data || [];
      displayMemories(allMemories);
      isSearching = false;
    } else {
      showError('Failed to load memories. Make sure the backend is running.');
      displayEmptyState('Failed to connect to server');
    }
  });
}

// Handle search
function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    loadMemories();
    return;
  }

  showLoading(true);
  hideError();

  chrome.runtime.sendMessage(
    { action: 'searchMemories', query },
    (response) => {
      showLoading(false);

      if (response && response.success) {
        allMemories = response.data.data || [];
        displayMemories(allMemories);
        isSearching = true;
        clearSearchBtn.classList.remove('hidden');
      } else {
        showError('Search failed. Please try again.');
      }
    }
  );
}

// Clear search
function handleClearSearch() {
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  loadMemories();
}

// Display memories
function displayMemories(memories) {
  memoriesList.innerHTML = '';

  if (memories.length === 0) {
    displayEmptyState(
      isSearching ? 'No memories found' : 'No memories yet',
      isSearching ? 'Try a different search' : 'Start saving your thoughts!'
    );
    memoryCount.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  memoryCount.classList.remove('hidden');
  memoryCount.textContent = isSearching
    ? `Found ${memories.length} result(s)`
    : `Total memories: ${memories.length}`;

  memories.forEach((memory) => {
    const card = createMemoryCard(memory);
    memoriesList.appendChild(card);
  });
}

// Create memory card element
function createMemoryCard(memory) {
  const card = document.createElement('div');
  card.className = 'memory-card';

  const isLongText = memory.text.length > 100;
  const textId = `text-${memory._id}`;

  card.innerHTML = `
    <div class="memory-header">
      <h3 class="memory-title">${escapeHtml(memory.title)}</h3>
      <button class="btn btn-danger" data-id="${memory._id}">Delete</button>
    </div>
    ${
      memory.imagePath || memory.imageData
        ? `<div class="memory-image-container">
            <img src="${memory.imagePath ? 'http://localhost:5000' + memory.imagePath : memory.imageData}" alt="${escapeHtml(memory.title)}" class="memory-image">
          </div>`
        : ''
    }
    <p class="memory-text ${isLongText ? 'collapsed' : ''}" id="${textId}">
      ${escapeHtml(memory.text)}
    </p>
    ${isLongText ? `<button class="expand-btn" data-target="${textId}">Show more</button>` : ''}
    ${
      memory.metadata?.context
        ? `<p class="memory-context">Note: ${escapeHtml(memory.metadata.context)}</p>`
        : ''
    }
    ${
      memory.tags && memory.tags.length > 0
        ? `<div class="memory-tags">
            ${memory.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>`
        : ''
    }
    <div class="memory-footer">
      <a href="${escapeHtml(memory.url)}" target="_blank" class="memory-url" title="${escapeHtml(memory.url)}">
        ${escapeHtml(memory.url)}
      </a>
      <span>${formatDate(memory.createdAt)}</span>
    </div>
  `;

  // Delete button event
  const deleteBtn = card.querySelector('.btn-danger');
  deleteBtn.addEventListener('click', () => handleDeleteMemory(memory._id));

  // Expand/collapse button event
  if (isLongText) {
    const expandBtn = card.querySelector('.expand-btn');
    expandBtn.addEventListener('click', (e) => {
      const textElement = document.getElementById(e.target.dataset.target);
      textElement.classList.toggle('collapsed');
      e.target.textContent = textElement.classList.contains('collapsed')
        ? 'Show more'
        : 'Show less';
    });
  }

  return card;
}

// Delete memory
function handleDeleteMemory(id) {
  if (!confirm('Are you sure you want to delete this memory?')) {
    return;
  }

  chrome.runtime.sendMessage({ action: 'deleteMemory', id }, (response) => {
    if (response && response.success) {
      loadMemories();
    } else {
      showError('Failed to delete memory');
    }
  });
}

// Show/hide add form
function showAddForm() {
  addForm.classList.remove('hidden');
  addMemoryBtn.classList.add('hidden');
  formTitle.focus();
}

function hideAddForm() {
  addForm.classList.add('hidden');
  addMemoryBtn.classList.remove('hidden');
  clearForm();
}

// Save new memory
function handleSaveMemory() {
  const title = formTitle.value.trim();
  const text = formText.value.trim();
  const url = formUrl.value.trim();
  const context = formContext.value.trim();
  const tagsStr = formTags.value.trim();

  if (!title || !text || !url) {
    showError('Please fill in all required fields');
    return;
  }

  const tags = tagsStr
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '');

  const memoryData = {
    title,
    text,
    url,
    context,
    tags,
  };

  chrome.runtime.sendMessage(
    { action: 'saveMemory', data: memoryData },
    (response) => {
      if (response && response.success) {
        hideAddForm();
        loadMemories();
      } else {
        showError('Failed to save memory');
      }
    }
  );
}

// Clear form
function clearForm() {
  formTitle.value = '';
  formText.value = '';
  formUrl.value = '';
  formContext.value = '';
  formTags.value = '';
}

// Open dashboard
function handleOpenDashboard(e) {
  e.preventDefault();
  chrome.tabs.create({ url: 'http://localhost:5173' });
}

// UI Helper Functions
function showLoading(show) {
  if (show) {
    loading.classList.remove('hidden');
    memoriesList.classList.add('hidden');
    emptyState.classList.add('hidden');
  } else {
    loading.classList.add('hidden');
    memoriesList.classList.remove('hidden');
  }
}

function displayEmptyState(title = 'No memories yet', message = 'Start saving!') {
  emptyState.classList.remove('hidden');
  memoriesList.classList.add('hidden');
  const titleEl = emptyState.querySelector('h3');
  const messageEl = emptyState.querySelector('.empty-message');
  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  errorMessage.classList.add('hidden');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
