const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    index: true
  },
  eventName: {
    type: String,
    trim: true
  },
  groupImageId: {
    type: mongoose.Schema.Types.ObjectId
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  location: String,
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    faceBox: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  }],
  totalFacesDetected: {
    type: Number,
    default: 0
  },
  unidentifiedFaces: {
    type: Number,
    default: 0
  },
  processingTime: {
    type: Number,
    comment: 'Processing time in milliseconds'
  }
});

// Compound indexes for efficient queries
AttendanceSchema.index({ eventId: 1, timestamp: -1 });
AttendanceSchema.index({ 'attendees.userId': 1 });
AttendanceSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
