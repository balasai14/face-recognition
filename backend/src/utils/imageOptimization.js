const sharp = require('sharp');
const logger = require('./logger');

class ImageOptimization {
  async compressImage(buffer, options = {}) {
    try {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 80,
        format = 'jpeg'
      } = options;

      const compressed = await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, { quality })
        .toBuffer();

      const originalSize = buffer.length;
      const compressedSize = compressed.length;
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

      logger.info(`Image compressed: ${originalSize} -> ${compressedSize} bytes (${savings}% savings)`);

      return compressed;
    } catch (error) {
      logger.error(`Image compression error: ${error.message}`);
      return buffer; // Return original if compression fails
    }
  }

  async resizeForML(buffer, targetSize = { width: 160, height: 160 }) {
    try {
      const resized = await sharp(buffer)
        .resize(targetSize.width, targetSize.height, {
          fit: 'cover',
          position: 'center'
        })
        .toBuffer();

      return resized;
    } catch (error) {
      logger.error(`Image resize error: ${error.message}`);
      throw error;
    }
  }

  async generateThumbnail(buffer, size = 200) {
    try {
      const thumbnail = await sharp(buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toBuffer();

      return thumbnail;
    } catch (error) {
      logger.error(`Thumbnail generation error: ${error.message}`);
      throw error;
    }
  }

  async getImageMetadata(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
        hasAlpha: metadata.hasAlpha
      };
    } catch (error) {
      logger.error(`Get metadata error: ${error.message}`);
      return null;
    }
  }
}

module.exports = new ImageOptimization();
