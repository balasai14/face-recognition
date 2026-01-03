const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const metrics = require('../utils/metrics');
const mongoose = require('mongoose');

// @desc    Get system metrics
// @route   GET /api/monitoring/metrics
// @access  Private/Admin
router.get('/metrics', protect, authorize('admin'), (req, res) => {
  res.json(metrics.getMetrics());
});

// @desc    Get system health
// @route   GET /api/monitoring/health
// @access  Public
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      mlIndividual: 'unknown',
      mlGroup: 'unknown',
      mlCrowd: 'unknown'
    }
  };

  // Check database
  try {
    if (mongoose.connection.readyState === 1) {
      health.services.database = 'healthy';
    } else {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  // Check ML services
  const axios = require('axios');
  
  try {
    await axios.get(`${process.env.ML_SERVICE_INDIVIDUAL_URL}/health`, { timeout: 2000 });
    health.services.mlIndividual = 'healthy';
  } catch (error) {
    health.services.mlIndividual = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    await axios.get(`${process.env.ML_SERVICE_GROUP_URL}/health`, { timeout: 2000 });
    health.services.mlGroup = 'healthy';
  } catch (error) {
    health.services.mlGroup = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    await axios.get(`${process.env.ML_SERVICE_CROWD_URL}/health`, { timeout: 2000 });
    health.services.mlCrowd = 'healthy';
  } catch (error) {
    health.services.mlCrowd = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// @desc    Reset metrics
// @route   POST /api/monitoring/metrics/reset
// @access  Private/Admin
router.post('/metrics/reset', protect, authorize('admin'), (req, res) => {
  metrics.reset();
  res.json({ message: 'Metrics reset successfully' });
});

module.exports = router;
