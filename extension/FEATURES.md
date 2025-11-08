# Project Synapse Extension v2.0 - Feature Documentation

## Table of Contents
1. [Offline Mode](#offline-mode)
2. [Automatic Tagging](#automatic-tagging)
3. [Export/Import](#exportimport)
4. [Settings Page](#settings-page)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Quick Notes Panel](#quick-notes-panel)
7. [Image Capture](#image-capture)

---

## Offline Mode

### Overview
Offline mode ensures you never lose a memory, even when your backend server is down or you're without internet connection.

### How It Works
1. **Automatic Fallback**: When the backend is unreachable, memories are automatically saved to local browser storage
2. **Visual Indicator**: Notifications clearly indicate when a memory is saved offline
3. **Auto-Sync**: Every 60 seconds, the extension checks for offline memories and syncs them automatically when the backend is available
4. **Manual Sync**: Use the "Sync Offline Data" button in settings to force a sync

### Use Cases
- Working on airplane without WiFi
- Backend server is down for maintenance
- Slow or unreliable internet connection
- Development/testing without running backend

### Settings
Enable/disable offline mode in Settings → General Settings → "Enable offline mode"

---

## Automatic Tagging

### Overview
Automatically suggests relevant tags for your memories based on content analysis.

### How It Works
1. **Keyword Extraction**: Analyzes text for common tech/productivity keywords
2. **Pattern Recognition**: Identifies programming code, tutorials, articles
3. **Smart Suggestions**: Limits to top 5 most relevant tags
4. **No Manual Effort**: Tags are added automatically when saving

### Supported Categories
- **Programming**: javascript, python, react, node, api, etc.
- **Content Types**: tutorial, guide, article, documentation
- **Tech Topics**: database, security, cloud, docker, AI, machine learning
- **General**: productivity, code, development

### Settings
Enable/disable auto-tagging in Settings → General Settings → "Enable automatic tagging"

### Customization
Currently uses a curated keyword list. Future versions will support:
- Custom keyword lists
- AI-powered tagging with GPT/Claude
- Learning from your tagging patterns

---

## Export/Import

### Export Data

**Purpose**: Backup all your memories or migrate to another system

**How to Export**:
1. Open Settings (right-click extension icon → Options)
2. Scroll to "Data Management"
3. Click "Export All Data"
4. Downloads a JSON file with all memories

**What's Included**:
- All memories from backend
- All cached memories
- All offline memories (deduplicated)
- Metadata: export date, version, count

**File Format**:
```json
{
  "version": "1.0.0",
  "exportDate": "2025-11-08T12:00:00Z",
  "memoriesCount": 150,
  "memories": [...]
}
```

### Import Data

**Purpose**: Restore backup or migrate from another system

**How to Import**:
1. Open Settings
2. Click "Import Data"
3. Select your JSON file
4. Confirm the import

**Important Notes**:
- Import adds memories (doesn't replace existing)
- Duplicates are handled automatically
- Progress is shown during import
- Failed imports are reported

**Use Cases**:
- Restore from backup
- Share memory collections with team
- Migrate between systems
- Combine multiple exports

---

## Settings Page

### Access
- Right-click extension icon → "Options"
- Or click the extension icon → Settings link

### General Settings

**Backend API URL**
- Configure custom backend server
- Default: `http://localhost:5000/api`
- Change for production deployments

**Enable Notifications**
- Toggle save confirmation notifications
- Recommended: Keep enabled

**Enable Offline Mode**
- Saves memories locally when backend unavailable
- Auto-syncs when back online

**Enable Automatic Tagging**
- Auto-suggests tags based on content
- Saves manual tagging effort

### Appearance

**Theme Options**:
- Light mode
- Dark mode (coming soon)
- Auto (follows system preference)

### Data Management

**Storage Usage**
- View total memories stored locally
- See breakdown: cached vs offline
- Visual progress bar

**Actions**:
- **Export All Data**: Backup everything
- **Import Data**: Restore from backup
- **Sync Offline Data**: Manually trigger sync
- **Clear Local Cache**: Free up storage (keeps offline memories)

---

## Keyboard Shortcuts

### Save Selection
- **Windows/Linux**: `Ctrl + Shift + S`
- **Mac**: `Cmd + Shift + S`

**Usage**:
1. Highlight text on any webpage
2. Press the keyboard shortcut
3. Text is saved instantly with notification

**Benefits**:
- Faster than right-click menu
- Works on any page
- Muscle memory for power users

### Open Quick Notes
- **Windows/Linux**: `Ctrl + Shift + N`
- **Mac**: `Cmd + Shift + N`

**Usage**:
- Press shortcut to open note panel
- Type your note
- Press Ctrl+Enter to save
- Panel stays open for multiple notes

### Customize Shortcuts
1. Go to `chrome://extensions/shortcuts`
2. Find "Project Synapse"
3. Click edit icons to change shortcuts

---

## Quick Notes Panel

### Overview
A dedicated, distraction-free note-taking window for quick thoughts.

### Features
- **Fast Access**: Ctrl+Shift+N from anywhere
- **Popup Window**: Doesn't navigate away from current page
- **Auto-Tagging**: All notes get 'quick-note' tag
- **Ctrl+Enter**: Quick save without clicking
- **Auto-Clear**: Form clears after successful save
- **Offline Support**: Works without backend

### Use Cases
- Capture fleeting thoughts while browsing
- Quick meeting notes
- Random ideas and todos
- Code snippets
- Writing drafts

### Best Practices
- Keep notes short and focused
- Use tags for organization
- Title is optional but helps with search
- Use Ctrl+Enter for rapid note-taking

---

## Image Capture

### Overview
Save references to images you find on the web.

### How to Use
1. Right-click any image on a webpage
2. Select "Capture Image to Synapse"
3. Image URL and context are saved

### What's Saved
- Image URL (for viewing later)
- Source page URL
- Page title
- Automatic tags: 'image', 'screenshot'

### Use Cases
- Design inspiration
- Product screenshots
- Infographics and diagrams
- Reference images
- Visual bookmarks

### Limitations
- Saves URL reference, not the actual image file
- Images may become unavailable if removed from source
- Future version will support image downloads

---

## Tips for Maximum Productivity

1. **Learn Keyboard Shortcuts**: Ctrl+Shift+S becomes muscle memory
2. **Enable Offline Mode**: Never lose a memory
3. **Regular Exports**: Backup monthly for safety
4. **Use Quick Notes**: Faster than opening popup
5. **Let Auto-Tagging Work**: Review and adjust tags later
6. **Customize Settings**: Set backend URL for production use
7. **Check Sync Status**: Occasionally verify offline memories synced

---

## Troubleshooting

### Offline Mode Not Working
- Check Settings → Enable offline mode is checked
- Try manual sync button
- Check browser console for errors

### Auto-Tagging Not Generating Tags
- Feature is keyword-based, may not match all content
- Manually add tags when needed
- Works best with tech/programming content

### Export File Too Large
- Export is JSON text (compresses well)
- Large exports (1000+ memories) may take time
- Consider periodic smaller exports

### Import Failed
- Verify JSON file format
- Check file isn't corrupted
- Try smaller batches if large file

### Keyboard Shortcuts Not Working
- Check `chrome://extensions/shortcuts`
- Ensure no conflicts with other extensions
- Some pages block extension shortcuts (chrome:// pages)

---

## Future Enhancements

### Planned Features
- AI-powered tagging with GPT/Claude API
- Full image downloads (not just URLs)
- Rich text note editor
- Voice-to-text notes
- Browser sync across devices
- Firefox support
- Mobile companion app
- Collaborative sharing

---

## FAQ

**Q: Does offline mode work forever?**
A: Local storage has browser limits (~10MB), typically 5000-10000 memories. The extension will warn when nearing limits.

**Q: Are my memories private?**
A: Yes! Everything is stored locally or on your own backend. No third-party servers.

**Q: Can I use a remote backend?**
A: Absolutely! Change the API URL in settings to point to your production server.

**Q: What happens to offline memories if I clear browser data?**
A: They'll be lost unless exported. Always export before clearing browser data.

**Q: Can I disable auto-tagging for specific saves?**
A: Currently all or nothing. Future version will have per-save override.

**Q: How do I share memories with others?**
A: Use Export feature to create a JSON file, then share the file. Recipients can import it.
