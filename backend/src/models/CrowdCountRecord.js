const mongoose = require('mongoose');

const CrowdCountSchema = new mongoose.Schema({
  imageId: {
    type: mongoose.Schema.Types.ObjectId
  },
  densityMapId: {
    type: mongoose.Schema.Types.ObjectId
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  location: {
    type: String,
    index: true
  },
  eventName: String,
  faceCount: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedAccuracy: {
    type: Number,
    min: 0,
    max: 1
  },
  modelUsed: {
    type: String,
    enum: ['YOLO', 'MCNN', 'YOLO+MCNN'],
    default: 'YOLO+MCNN'
  },
  processingTime: {
    type: Number,
    comment: 'Processing time in milliseconds'
  },
  metadata: {
    imageResolution: String,
    crowdDensity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    weatherConditions: String
  }
});

// Indexes for efficient queries
CrowdCountSchema.index({ timestamp: -1 });
CrowdCountSchema.index({ location: 1, timestamp: -1 });

module.exports = mongoose.model('CrowdCount', CrowdCountSchema);
