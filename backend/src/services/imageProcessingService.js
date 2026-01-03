const { uploadToGridFS, downloadFromGridFS, deleteFromGridFS } = require('../utils/gridfs');
const logger = require('../utils/logger');

class ImageProcessingService {
  constructor() {
    this.allowedFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    this.maxSize = 10 * 1024 * 1024; // 10MB
  }

  validateImage(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!this.allowedFormats.includes(file.mimetype)) {
      throw new Error('Invalid file format. Only JPEG and PNG are allowed');
    }

    if (file.size > this.maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    return true;
  }

  async saveToGridFS(buffer, filename, metadata = {}) {
    try {
      const imageId = await uploadToGridFS(buffer, filename, metadata);
      logger.info(`Image saved to GridFS: ${imageId}`);
      return imageId;
    } catch (error) {
      logger.error(`Error saving image to GridFS: ${error.message}`);
      throw error;
    }
  }

  async retrieveFromGridFS(imageId) {
    try {
      const buffer = await downloadFromGridFS(imageId);
      return buffer;
    } catch (error) {
      logger.error(`Error retrieving image from GridFS: ${error.message}`);
      throw error;
    }
  }

  async deleteImage(imageId) {
    try {
      await deleteFromGridFS(imageId);
      logger.info(`Image deleted from GridFS: ${imageId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting image from GridFS: ${error.message}`);
      throw error;
    }
  }

  bufferToBase64(buffer) {
    return buffer.toString('base64');
  }

  base64ToBuffer(base64String) {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  assessImageQuality(file) {
    // Basic quality assessment based on file size and dimensions
    // In production, this would use more sophisticated algorithms
    const sizeScore = Math.min(file.size / (1024 * 1024), 1); // Normalize to 0-1
    return sizeScore;
  }
}

module.exports = new ImageProcessingService();
