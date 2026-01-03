const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    logger.info('Redis not configured, caching disabled');
    return null;
  }

  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error(`Redis connection failed: ${error.message}`);
    return null;
  }
};

const getCache = async (key) => {
  if (!redisClient) return null;
  
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Cache get error: ${error.message}`);
    return null;
  }
};

const setCache = async (key, value, ttl = 3600) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error(`Cache set error: ${error.message}`);
    return false;
  }
};

const deleteCache = async (key) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error(`Cache delete error: ${error.message}`);
    return false;
  }
};

const clearCache = async (pattern = '*') => {
  if (!redisClient) return false;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    logger.error(`Cache clear error: ${error.message}`);
    return false;
  }
};

module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  clearCache
};
