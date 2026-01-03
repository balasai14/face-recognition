const APIKey = require('../models/APIKey');
const logger = require('../utils/logger');

// @desc    Generate new API key
// @route   POST /api/keys/generate
// @access  Private
exports.generateKey = async (req, res, next) => {
  try {
    const { name, permissions, expiresIn } = req.body;

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await APIKey.create({
      userId: req.user._id,
      name,
      permissions: permissions || ['individual_auth', 'group_auth', 'crowd_count'],
      expiresAt
    });

    logger.info(`API key generated for user: ${req.user._id}`);

    res.status(201).json({
      key: apiKey.key,
      name: apiKey.name,
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List user's API keys
// @route   GET /api/keys
// @access  Private
exports.listKeys = async (req, res, next) => {
  try {
    const keys = await APIKey.find({ userId: req.user._id })
      .select('-key')
      .sort({ createdAt: -1 });

    res.json({ keys });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke API key
// @route   DELETE /api/keys/:keyId
// @access  Private
exports.revokeKey = async (req, res, next) => {
  try {
    const apiKey = await APIKey.findOne({
      _id: req.params.keyId,
      userId: req.user._id
    });

    if (!apiKey) {
      return res.status(404).json({
        error: {
          code: 'KEY_NOT_FOUND',
          message: 'API key not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    apiKey.isActive = false;
    await apiKey.save();

    logger.info(`API key revoked: ${req.params.keyId}`);

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    next(error);
  }
};
