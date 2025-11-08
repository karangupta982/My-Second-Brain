// Quick Notes Script

const form = document.getElementById('quick-note-form');
const titleInput = document.getElementById('note-title');
const textArea = document.getElementById('note-text');
const tagsInput = document.getElementById('note-tags');
const saveBtn = document.getElementById('save-btn');
const messageDiv = document.getElementById('message');

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await saveNote();
});

// Keyboard shortcut: Ctrl+Enter to save
textArea.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    saveNote();
  }
});

// Save note function
async function saveNote() {
  const text = textArea.value.trim();

  if (!text) {
    showMessage('Please enter some text', 'error');
    return;
  }

  const title = titleInput.value.trim() || 'Quick Note';
  const tagsStr = tagsInput.value.trim();
  const tags = tagsStr
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '');

  // Add 'quick-note' tag automatically
  if (!tags.includes('quick-note')) {
    tags.push('quick-note');
  }

  const memoryData = {
    text,
    title,
    url: window.location.href || 'chrome-extension://quick-notes',
    context: 'Created via Quick Notes panel',
    tags
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'saveMemory',
      data: memoryData
    });

    if (response && response.success) {
      const message = response.data.offline
        ? 'Note saved offline (will sync when online)'
        : 'Note saved successfully!';
      showMessage(message, 'success');

      // Clear form after 1 second
      setTimeout(() => {
        titleInput.value = '';
        textArea.value = '';
        tagsInput.value = '';
        textArea.focus();
        messageDiv.style.display = 'none';
      }, 1500);
    } else {
      showMessage('Failed to save note', 'error');
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Note';
  }
}

// Show message function
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;

  if (type === 'error') {
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }
}

// Focus on text area
textArea.focus();
