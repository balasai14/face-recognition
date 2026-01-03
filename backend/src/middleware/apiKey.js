const APIKey = require('../models/APIKey');
const logger = require('../utils/logger');

const validateAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        error: {
          code: 'API_KEY_MISSING',
          message: 'API key is required',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Find and validate API key
    const keyDoc = await APIKey.findOne({ key: apiKey, isActive: true });

    if (!keyDoc) {
      return res.status(401).json({
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid or inactive API key',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check expiration
    if (keyDoc.expiresAt && keyDoc.expiresAt < new Date()) {
      return res.status(401).json({
        error: {
          code: 'API_KEY_EXPIRED',
          message: 'API key has expired',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check permissions
    const endpoint = req.path.split('/')[2]; // Extract service from path
    const permissionMap = {
      individual: 'individual_auth',
      group: 'group_auth',
      crowd: 'crowd_count'
    };

    const requiredPermission = permissionMap[endpoint];
    if (requiredPermission && !keyDoc.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'API key does not have permission for this endpoint',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Update last used
    keyDoc.lastUsed = new Date();
    await keyDoc.save();

    // Attach key info to request
    req.apiKey = keyDoc;

    next();
  } catch (error) {
    logger.error(`API key validation error: ${error.message}`);
    next(error);
  }
};

module.exports = validateAPIKey;
