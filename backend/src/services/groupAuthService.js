const axios = require('axios');
const FaceProfile = require('../models/FaceProfile');
const AttendanceRecord = require('../models/AttendanceRecord');
const imageProcessingService = require('./imageProcessingService');
const encryptionService = require('../utils/encryption');
const logger = require('../utils/logger');

class GroupAuthService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_GROUP_URL || 'http://localhost:5002';
    this.confidenceThreshold = 0.85;
  }

  async authenticateGroup(imageBuffer, eventId, eventName, location) {
    try {
      const startTime = Date.now();

      // Save group image to GridFS
      const groupImageId = await imageProcessingService.saveToGridFS(
        imageBuffer,
        `group_${eventId}_${Date.now()}.jpg`,
        { eventId, type: 'group_authentication' }
      );

      // Get face detections and embeddings from ML service
      const base64Image = imageProcessingService.bufferToBase64(imageBuffer);
      const detectionResult = await this.detectAndExtractFaces(base64Image);

      // Get all registered face profiles
      const faceProfiles = await FaceProfile.find({ isActive: true });

      const attendees = [];
      let unidentifiedCount = 0;

      // Match each detected face
      for (const detectedFace of detectionResult.faces) {
        let bestMatch = null;
        let highestSimilarity = 0;

        for (const profile of faceProfiles) {
          for (const storedEmbedding of profile.faceEmbeddings) {
            // Decrypt stored embedding
            const decryptedEmbedding = JSON.parse(
              encryptionService.decrypt(storedEmbedding.vector)
            );

            // Calculate cosine similarity
            const similarity = this.cosineSimilarity(
              detectedFace.embedding,
              decryptedEmbedding
            );

            if (similarity > highestSimilarity) {
              highestSimilarity = similarity;
              bestMatch = profile;
            }
          }
        }

        if (bestMatch && highestSimilarity >= this.confidenceThreshold) {
          attendees.push({
            userId: bestMatch.userId,
            name: bestMatch.name,
            confidence: highestSimilarity,
            faceBox: {
              x: detectedFace.bbox[0],
              y: detectedFace.bbox[1],
              width: detectedFace.bbox[2],
              height: detectedFace.bbox[3]
            }
          });
        } else {
          unidentifiedCount++;
        }
      }

      const processingTime = Date.now() - startTime;

      // Create attendance record
      const attendanceRecord = await AttendanceRecord.create({
        eventId,
        eventName,
        groupImageId,
        location,
        attendees,
        totalFacesDetected: detectionResult.faces.length,
        unidentifiedFaces: unidentifiedCount,
        processingTime
      });

      logger.info(`Group authentication completed for event: ${eventId}`);

      return {
        recordId: attendanceRecord._id,
        totalFaces: detectionResult.faces.length,
        identified: attendees,
        unidentified: unidentifiedCount,
        processingTime
      };
    } catch (error) {
      logger.error(`Group authentication error: ${error.message}`);
      throw error;
    }
  }

  async getAttendanceRecord(eventId) {
    try {
      const record = await AttendanceRecord.findOne({ eventId })
        .populate('attendees.userId')
        .sort({ timestamp: -1 });

      return record;
    } catch (error) {
      logger.error(`Get attendance record error: ${error.message}`);
      throw error;
    }
  }

  async getAttendanceHistory(filters = {}) {
    try {
      const query = {};

      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.timestamp.$lte = new Date(filters.endDate);
        }
      }

      if (filters.userId) {
        query['attendees.userId'] = filters.userId;
      }

      if (filters.eventId) {
        query.eventId = filters.eventId;
      }

      const records = await AttendanceRecord.find(query)
        .populate('attendees.userId')
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100);

      return records;
    } catch (error) {
      logger.error(`Get attendance history error: ${error.message}`);
      throw error;
    }
  }

  async detectAndExtractFaces(base64Image) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/detect-and-extract`,
        { image: base64Image },
        { timeout: 15000 }
      );

      return response.data;
    } catch (error) {
      logger.error(`ML service error: ${error.message}`);
      throw new Error('Face detection service unavailable');
    }
  }

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

module.exports = new GroupAuthService();
