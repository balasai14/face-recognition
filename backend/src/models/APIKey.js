const mongoose = require('mongoose');
const crypto = require('crypto');

const APIKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  permissions: [{
    type: String,
    enum: ['individual_auth', 'group_auth', 'crowd_count']
  }],
  rateLimit: {
    type: Number,
    default: 100,
    comment: 'Requests per minute'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  lastUsed: Date
});

// Generate API key before saving
APIKeySchema.pre('save', function(next) {
  if (!this.key) {
    this.key = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Index for efficient lookups
APIKeySchema.index({ key: 1, isActive: 1 });
APIKeySchema.index({ userId: 1 });

module.exports = mongoose.model('APIKey', APIKeySchema);
