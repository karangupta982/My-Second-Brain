// Content Script for Project Synapse
// Runs on every webpage to handle text selection and saving

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveSelection') {
    const memoryData = {
      text: request.text,
      url: request.url,
      title: request.title,
      context: '', // User can add context later if needed
      tags: [],
    };

    // Send to background script to save
    chrome.runtime.sendMessage(
      {
        action: 'saveMemory',
        data: memoryData,
      },
      (response) => {
        if (response && response.success) {
          showNotification('Memory saved successfully!', 'success');
        } else {
          showNotification('Failed to save memory', 'error');
        }
      }
    );
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

console.log('Project Synapse content script loaded');
