const axios = require('axios');
const FaceProfile = require('../models/FaceProfile');
const imageProcessingService = require('./imageProcessingService');
const encryptionService = require('../utils/encryption');
const logger = require('../utils/logger');

class IndividualAuthService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_INDIVIDUAL_URL || 'http://localhost:5001';
    this.confidenceThreshold = 0.85;
  }

  async registerUser(userId, files, metadata) {
    try {
      const faceImages = [];
      const faceEmbeddings = [];

      // Process each image
      for (const file of files) {
        // Validate image
        imageProcessingService.validateImage(file);

        // Save to GridFS
        const imageId = await imageProcessingService.saveToGridFS(
          file.buffer,
          file.originalname,
          { userId, type: 'registration' }
        );

        // Get embedding from ML service
        const base64Image = imageProcessingService.bufferToBase64(file.buffer);
        const embedding = await this.getEmbedding(base64Image);

        // Encrypt embedding
        const encryptedEmbedding = encryptionService.encrypt(JSON.stringify(embedding.embedding));

        faceImages.push({
          imageId,
          capturedAt: new Date(),
          quality: imageProcessingService.assessImageQuality(file)
        });

        faceEmbeddings.push({
          vector: encryptedEmbedding,
          modelVersion: 'v1.0',
          createdAt: new Date()
        });
      }

      // Create or update face profile
      let faceProfile = await FaceProfile.findOne({ userId });

      if (faceProfile) {
        faceProfile.faceImages.push(...faceImages);
        faceProfile.faceEmbeddings.push(...faceEmbeddings);
        faceProfile.metadata = { ...faceProfile.metadata, ...metadata };
        await faceProfile.save();
      } else {
        faceProfile = await FaceProfile.create({
          userId,
          name: metadata.name,
          metadata,
          faceImages,
          faceEmbeddings
        });
      }

      logger.info(`User registered: ${userId}`);

      return {
        userId,
        faceId: faceProfile._id,
        imagesCount: faceImages.length,
        message: 'Registration successful'
      };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  async authenticateUser(imageBuffer) {
    try {
      const startTime = Date.now();

      // Get embedding from ML service
      const base64Image = imageProcessingService.bufferToBase64(imageBuffer);
      const result = await this.getEmbedding(base64Image);

      // Find matching face profile
      const faceProfiles = await FaceProfile.find({ isActive: true });

      let bestMatch = null;
      let highestSimilarity = 0;

      for (const profile of faceProfiles) {
        for (const storedEmbedding of profile.faceEmbeddings) {
          // Decrypt stored embedding
          const decryptedEmbedding = JSON.parse(
            encryptionService.decrypt(storedEmbedding.vector)
          );

          // Calculate cosine similarity
          const similarity = this.cosineSimilarity(result.embedding, decryptedEmbedding);

          if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatch = profile;
          }
        }
      }

      const processingTime = Date.now() - startTime;

      if (bestMatch && highestSimilarity >= this.confidenceThreshold) {
        // Update last authenticated
        bestMatch.lastAuthenticated = new Date();
        await bestMatch.save();

        return {
          authenticated: true,
          userId: bestMatch.userId,
          name: bestMatch.name,
          confidence: highestSimilarity,
          processingTime
        };
      }

      return {
        authenticated: false,
        confidence: highestSimilarity,
        processingTime
      };
    } catch (error) {
      logger.error(`Authentication error: ${error.message}`);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const profile = await FaceProfile.findOne({ userId }).populate('userId');
      return profile;
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const profile = await FaceProfile.findOne({ userId });

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Delete images from GridFS
      for (const image of profile.faceImages) {
        await imageProcessingService.deleteImage(image.imageId);
      }

      // Delete profile
      await FaceProfile.deleteOne({ userId });

      logger.info(`User deleted: ${userId}`);

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      logger.error(`Delete user error: ${error.message}`);
      throw error;
    }
  }

  async getEmbedding(base64Image) {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/predict`, {
        image: base64Image
      }, {
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      logger.error(`ML service error: ${error.message}`);
      throw new Error('Face recognition service unavailable');
    }
  }

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

module.exports = new IndividualAuthService();
