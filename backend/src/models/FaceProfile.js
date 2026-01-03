const mongoose = require('mongoose');

const FaceProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  metadata: {
    age: Number,
    gender: String,
    department: String
  },
  faceImages: [{
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    capturedAt: {
      type: Date,
      default: Date.now
    },
    quality: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  faceEmbeddings: [{
    vector: {
      type: String,
      required: true
    },
    modelVersion: {
      type: String,
      default: 'v1.0'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastAuthenticated: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

// Index for efficient user lookup
FaceProfileSchema.index({ userId: 1 });
FaceProfileSchema.index({ isActive: 1 });

module.exports = mongoose.model('FaceProfile', FaceProfileSchema);
