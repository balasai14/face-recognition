const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_REGISTER',
      'USER_LOGIN',
      'FACE_REGISTER',
      'FACE_AUTHENTICATE',
      'GROUP_AUTHENTICATE',
      'CROWD_COUNT',
      'DATA_ACCESS',
      'DATA_DELETE',
      'PROFILE_VIEW',
      'ATTENDANCE_VIEW'
    ]
  },
  resourceType: {
    type: String,
    enum: ['User', 'FaceProfile', 'Attendance', 'CrowdCount', 'Image']
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  ipAddress: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  }
});

// Indexes for efficient queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
