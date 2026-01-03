const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const auditLog = (action, resourceType = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to log after response
    res.send = function(data) {
      // Restore original send
      res.send = originalSend;

      // Log the action
      const logEntry = {
        userId: req.user ? req.user._id : null,
        action,
        resourceType,
        resourceId: req.params.id || req.params.userId || req.params.eventId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          statusCode: res.statusCode
        },
        status: res.statusCode < 400 ? 'success' : 'failure'
      };

      AuditLog.create(logEntry).catch(err => {
        logger.error(`Audit log error: ${err.message}`);
      });

      // Send the response
      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditLog;
