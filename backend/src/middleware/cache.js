const { getCache, setCache } = require('../config/redis');
const logger = require('../utils/logger');

const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cachedData = await getCache(cacheKey);
      
      if (cachedData) {
        logger.info(`Cache hit: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Cache miss - store original send function
      const originalSend = res.send;
      
      res.send = function(data) {
        // Restore original send
        res.send = originalSend;

        // Cache the response if successful
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            setCache(cacheKey, jsonData, duration);
            logger.info(`Cache set: ${cacheKey}`);
          } catch (error) {
            // Not JSON, skip caching
          }
        }

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error.message}`);
      next();
    }
  };
};

module.exports = cacheMiddleware;
