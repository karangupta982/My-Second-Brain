# Project Synapse - Browser Extension

A Chrome/Edge browser extension for capturing and saving web content to your Project Synapse second brain.

## Features

- **Context Menu Integration**: Right-click on selected text and save it to Synapse
- **Popup Interface**: View, search, and manage all your saved memories
- **Real-time Notifications**: Get instant feedback when saving memories
- **Seamless Integration**: Connects to your local Synapse backend

## Prerequisites

Before installing the extension, make sure you have:

1. **Backend Server Running**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend should be running on `http://localhost:5000`

2. **MongoDB Connection**
   - Ensure MongoDB is running and configured in the backend's `.env` file

## Installation Instructions

### 1. Prepare Extension Icons (First Time Only)

The extension requires icon files. You have two options:

**Option A: Create Your Own Icons**
- Follow instructions in `extension/icons/README.md`
- Create 16x16, 48x48, and 128x128 PNG icons
- Name them `icon16.png`, `icon48.png`, `icon128.png`

**Option B: Use Placeholder Icons (Quick Start)**
- Download any small PNG image
- Resize it to the required dimensions
- Place them in the `extension/icons/` folder

### 2. Load Extension in Chrome/Edge

1. **Open Extension Management Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Select the `extension` folder from your Project Synapse directory
   - The extension should now appear in your extensions list

4. **Pin the Extension (Optional)**
   - Click the puzzle icon in your browser toolbar
   - Find "Project Synapse" and click the pin icon
   - The extension icon will now appear in your toolbar

## How to Use

### Saving Text from Web Pages

1. **Using Context Menu (Right-Click)**
   - Highlight any text on a webpage
   - Right-click on the selected text
   - Click "Save to Synapse" from the context menu
   - You'll see a notification confirming the save

### Using the Popup Interface

1. **Open the Popup**
   - Click the Project Synapse icon in your browser toolbar

2. **View Your Memories**
   - All saved memories appear in the popup
   - Scroll through your saved content

3. **Search Memories**
   - Type a keyword in the search box
   - Click "Search" or press Enter
   - Results will be filtered based on your query
   - Click "Clear" to show all memories again

4. **Add Memory Manually**
   - Click "Add Memory" button
   - Fill in the form:
     - Title (required)
     - Text content (required)
     - URL (required)
     - Notes (optional)
     - Tags (optional, comma-separated)
   - Click "Save"

5. **Delete Memories**
   - Click the "Delete" button on any memory card
   - Confirm the deletion

6. **Open Dashboard**
   - Click "Open Dashboard" link at the bottom
   - Opens the full web dashboard in a new tab

## File Structure

```
extension/
├── manifest.json           # Extension configuration
├── background/
│   └── background.js      # Background service worker
├── content/
│   ├── content.js         # Content script (runs on web pages)
│   └── content.css        # Styles for notifications
├── popup/
│   ├── popup.html         # Popup interface
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup functionality
├── icons/
│   ├── icon16.png         # 16x16 toolbar icon
│   ├── icon48.png         # 48x48 management icon
│   └── icon128.png        # 128x128 store icon
├── utils/
│   └── api.js             # API utility functions
└── README.md              # This file
```

## Configuration

### Changing Backend URL

If your backend is running on a different port or host, update the API URL in:

1. **background/background.js** (line 3):
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

2. **manifest.json** - Update host permissions:
   ```json
   "host_permissions": [
     "http://localhost:5000/*"
   ]
   ```

After making changes, reload the extension:
- Go to `chrome://extensions/`
- Click the reload icon on the Project Synapse extension card

## Troubleshooting

### Extension Not Loading
- Make sure you selected the `extension` folder, not a subfolder
- Check that all required files are present
- Ensure icon files exist in the `icons/` folder

### Can't Save Memories
- Verify the backend server is running on `http://localhost:5000`
- Check browser console for error messages (F12 → Console)
- Ensure MongoDB is connected

### Context Menu Not Appearing
- Refresh the webpage after installing the extension
- Try reloading the extension from `chrome://extensions/`

### Popup Shows "Failed to load memories"
- Backend server is not running - start it with `npm run dev`
- Wrong API URL - check the configuration
- MongoDB connection issue - verify `.env` settings

## Development

### Making Changes

1. Edit the extension files
2. Go to `chrome://extensions/`
3. Click the reload icon on Project Synapse
4. Test your changes

### Debugging

- **Background Script**: `chrome://extensions/` → Click "service worker" under Project Synapse
- **Popup**: Right-click the popup → "Inspect"
- **Content Script**: Open any webpage → F12 → Console

## Next Steps

- Add support for capturing images
- Implement offline storage fallback
- Add keyboard shortcuts for quick saving
- Create options page for settings
- Add support for Firefox

## Support

If you encounter issues:
1. Check the backend server is running
2. Verify MongoDB connection
3. Check browser console for errors
4. Review the troubleshooting section above
