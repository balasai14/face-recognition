const axios = require('axios');
const CrowdCountRecord = require('../models/CrowdCountRecord');
const imageProcessingService = require('./imageProcessingService');
const logger = require('../utils/logger');

class CrowdCountingService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_CROWD_URL || 'http://localhost:5003';
  }

  async countFaces(imageBuffer, location, eventName, metadata = {}) {
    try {
      const startTime = Date.now();

      // Save image to GridFS
      const imageId = await imageProcessingService.saveToGridFS(
        imageBuffer,
        `crowd_${Date.now()}.jpg`,
        { type: 'crowd_counting', location, eventName }
      );

      // Get count from ML service
      const base64Image = imageProcessingService.bufferToBase64(imageBuffer);
      const countResult = await this.getCrowdCount(base64Image);

      // Save density map to GridFS
      const densityMapBuffer = Buffer.from(countResult.density_map, 'base64');
      const densityMapId = await imageProcessingService.saveToGridFS(
        densityMapBuffer,
        `density_map_${Date.now()}.jpg`,
        { type: 'density_map', location, eventName }
      );

      const processingTime = Date.now() - startTime;

      // Create crowd count record
      const record = await CrowdCountRecord.create({
        imageId,
        densityMapId,
        location,
        eventName,
        faceCount: countResult.count,
        estimatedAccuracy: countResult.confidence,
        modelUsed: 'YOLO+MCNN',
        processingTime,
        metadata: {
          imageResolution: metadata.imageResolution,
          crowdDensity: countResult.crowd_density || 'medium',
          weatherConditions: metadata.weatherConditions
        }
      });

      logger.info(`Crowd count completed: ${countResult.count} faces`);

      return {
        recordId: record._id,
        faceCount: countResult.count,
        accuracy: countResult.confidence,
        densityMap: countResult.density_map,
        processingTime,
        crowdDensity: countResult.crowd_density
      };
    } catch (error) {
      logger.error(`Crowd counting error: ${error.message}`);
      throw error;
    }
  }

  async getHistoricalData(filters = {}) {
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

      if (filters.location) {
        query.location = filters.location;
      }

      if (filters.eventName) {
        query.eventName = filters.eventName;
      }

      const records = await CrowdCountRecord.find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100);

      return records;
    } catch (error) {
      logger.error(`Get historical data error: ${error.message}`);
      throw error;
    }
  }

  async getCrowdCount(base64Image) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/count`,
        { image: base64Image },
        { timeout: 10000 }
      );

      return response.data;
    } catch (error) {
      logger.error(`ML service error: ${error.message}`);
      throw new Error('Crowd counting service unavailable');
    }
  }
}

module.exports = new CrowdCountingService();
