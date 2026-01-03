const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?._id
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    logger.info({
      type: 'response',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userId: req.user?._id
    });

    return originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;
