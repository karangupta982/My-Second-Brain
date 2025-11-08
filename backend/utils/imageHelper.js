import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Save base64 image data to file system
 * @param {string} base64Data - Base64 encoded image data (with data:image prefix)
 * @returns {Promise<string>} - Returns the path to saved image (e.g., "/images/1699123456789.jpg")
 */
export const saveBase64Image = async (base64Data) => {
  try {
    // Extract image format and data
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);

    if (!matches) {
      throw new Error('Invalid base64 image data');
    }

    const imageType = matches[1]; // jpg, png, gif, etc.
    const imageBuffer = Buffer.from(matches[2], 'base64');

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${imageType}`;

    // Define file path
    const imagesDir = path.join(__dirname, '..', 'public', 'images');
    const filePath = path.join(imagesDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, imageBuffer);

    // Return public URL path
    return `/images/${filename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image file');
  }
};

/**
 * Delete image file from file system
 * @param {string} imagePath - Path to image (e.g., "/images/1699123456789.jpg")
 */
export const deleteImage = (imagePath) => {
  try {
    if (!imagePath) return;

    const filename = path.basename(imagePath);
    const filePath = path.join(__dirname, '..', 'public', 'images', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted image: ${filename}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
