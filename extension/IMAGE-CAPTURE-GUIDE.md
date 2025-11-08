# Image Capture Feature - Complete Guide

## 🎉 What's New?

Images are now **actually captured and stored** as base64 data, not just URL references!

## ✨ How It Works

### 1. **Image Capture Process**
When you right-click an image:
1. Extension fetches the image from the URL
2. Converts it to base64 data URL
3. Stores the actual image data in the memory
4. Captures image dimensions and metadata

### 2. **What Gets Saved**
```javascript
{
  title: "Image from example.com",
  text: "Image captured from: Page Title",
  url: "https://example.com/page",  // Source page, not image URL
  context: "Original URL: https://example.com/image.jpg\nDimensions: 800x600",
  tags: ["image", "screenshot"],
  imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..." // Actual image!
}
```

## 📸 How to Use

### Method 1: Context Menu (Right-Click)
1. Visit any webpage with images
2. Right-click on any image
3. Select **"Capture Image to Synapse"**
4. Wait for notification: "Capturing image..." → "Image captured and saved!"

### Method 2: Test on These Sites
Good sites to test image capture:
- **Google Images**: `images.google.com`
- **Unsplash**: `unsplash.com`
- **Wikipedia**: `wikipedia.org`
- **Product pages**: Amazon, eBay, etc.

## 🔍 Viewing Captured Images

### In Extension Popup:
1. Click the extension icon
2. Find the captured image memory
3. **Image displays inline** in the card
4. Hover over image for slight zoom effect

### In Web Dashboard:
1. Open `http://localhost:5173`
2. Images display in their memory cards
3. Full-width, responsive display

## ⚡ Features

### ✅ What Works:
- **Actual Image Storage**: Base64 encoding stores the full image
- **Offline Access**: Images work even if original URL is removed
- **Dimension Detection**: Captures width x height automatically
- **Source Tracking**: Records original URL and page source
- **Auto-Tagging**: Adds "image" and "screenshot" tags
- **Click Protection**: Works with most public images

### ⚠️ Limitations:
1. **Protected Images**: Some sites use CORS protection
   - Fallback: Saves URL reference with warning message
2. **Large Images**: Base64 encoding increases size by ~33%
   - Recommended max: 5MB per image
3. **GIFs**: Static frame only (not animated)
4. **Videos**: Not supported (images only)

## 🛠️ Technical Details

### Base64 Encoding
```
Original Image Size: 100 KB
Base64 Encoded: ~133 KB
Storage: MongoDB (text field)
Display: <img src="data:image/jpeg;base64,...">
```

### CORS Handling
If image fetch fails due to CORS:
```
✅ Fallback activates automatically
📝 Saves URL reference instead
⚠️ Notification: "Image reference saved (direct capture failed)"
💡 Context includes warning message
```

## 📊 Storage Considerations

### MongoDB Storage:
- Images stored as base64 strings
- Average size: 50-500 KB per image
- Recommended limit: 100 images = ~50 MB

### Browser Extension Storage:
- Offline images use `chrome.storage.local`
- Limit: ~10 MB total
- Auto-sync clears after upload

### Tips:
1. **Capture thumbnails** instead of full-res images
2. **Use sparingly** for important images only
3. **Export regularly** to backup image data
4. **Clear cache** if running low on space

## 🧪 Testing Guide

### Basic Test:
```bash
1. Go to unsplash.com
2. Right-click any photo
3. "Capture Image to Synapse"
4. Check popup → Image should display
5. Check web dashboard → Image should show there too
```

### CORS Test (Should Fail Gracefully):
```bash
1. Try capturing protected images
2. Should see: "Image reference saved (direct capture failed)"
3. Memory still saved with URL reference
4. Context shows warning message
```

### Offline Test:
```bash
1. Stop backend server
2. Capture an image
3. Should save offline with image data
4. Restart backend
5. Image syncs to backend automatically
```

### Large Image Test:
```bash
1. Find a large image (>1MB)
2. Capture it
3. Check if it saves successfully
4. May take longer to process
```

## 🐛 Troubleshooting

### Image Not Displaying
**Problem**: Saved but shows broken image
**Solution**:
- Check if base64 data exists in memory
- Verify `imageData` field in MongoDB
- Check browser console for errors

### Capture Takes Too Long
**Problem**: "Capturing image..." notification stays forever
**Solution**:
- Image might be too large
- Check network speed
- Try smaller images first

### CORS Error
**Problem**: "Failed to process image"
**Solution**:
- Normal for protected images
- Fallback saves URL reference
- Try public image sites (Unsplash, Wikipedia)

### Image Quality Poor
**Problem**: Image looks pixelated
**Solution**:
- Source image was low quality
- Capture from higher resolution source
- Base64 preserves original quality

## 🔮 Future Enhancements

Planned improvements:
1. **Image Compression**: Reduce storage size automatically
2. **Multiple Formats**: Support WebP, PNG optimization
3. **Thumbnail Generation**: Store small preview + full image
4. **Gallery View**: Special view for image memories
5. **Image Search**: OCR text recognition in images
6. **Cloud Storage**: Optional upload to S3/Cloudinary
7. **Animated GIFs**: Full animation support
8. **Batch Capture**: Select multiple images at once

## 💡 Use Cases

### Design Inspiration
```
- Save UI screenshots from websites
- Collect color palettes
- Archive design patterns
```

### Product Research
```
- Capture product images
- Save specification screenshots
- Collect comparison charts
```

### Education
```
- Save diagrams from articles
- Capture infographics
- Archive visual tutorials
```

### Personal
```
- Save memes (properly!)
- Collect recipes with photos
- Archive important screenshots
```

## 📈 Best Practices

1. **Use Descriptive Titles**: Change "Captured Image" to something meaningful
2. **Add Context**: Use notes field to describe the image
3. **Tag Appropriately**: Add custom tags beyond "image"
4. **Regular Exports**: Backup images monthly
5. **Quality Over Quantity**: Only save truly useful images
6. **Check Size**: Monitor storage usage in settings

## 🎯 Quick Reference

| Action | Shortcut/Method |
|--------|----------------|
| Capture Image | Right-click → "Capture Image to Synapse" |
| View Images | Extension popup or web dashboard |
| Check Storage | Settings → Data Management → Storage Usage |
| Export Images | Settings → Export All Data |
| Clear Cache | Settings → Clear Local Cache |

## ✅ Verification Checklist

Test these to verify everything works:

```
[ ] Can right-click images to see capture option
[ ] Capture notification appears and completes
[ ] Image displays in extension popup
[ ] Image displays in web dashboard
[ ] CORS fallback works for protected images
[ ] Offline mode saves images locally
[ ] Images sync to backend after offline
[ ] Exported JSON includes image data
[ ] Imported images restore correctly
[ ] Large images (500KB+) process successfully
[ ] Multiple images can be captured in sequence
```

---

## 🆘 Need Help?

If images aren't capturing:
1. Check browser console (F12)
2. Verify backend is running
3. Test with simple public images first
4. Check extension permissions
5. Reload extension and try again

**Happy Image Capturing!** 📸
