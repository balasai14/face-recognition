const crowdCountingService = require('../services/crowdCountingService');
const logger = require('../utils/logger');

// @desc    Count faces in crowd image
// @route   POST /api/crowd/count
// @access  Private
exports.countCrowd = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'Please upload a crowd image',
          timestamp: new Date().toISOString()
        }
      });
    }

    const { location, eventName, imageResolution, weatherConditions } = req.body;

    const result = await crowdCountingService.countFaces(
      req.file.buffer,
      location,
      eventName,
      { imageResolution, weatherConditions }
    );

    logger.info(`Crowd counted: ${result.faceCount} faces`);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical crowd count data
// @route   GET /api/crowd/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      location: req.query.location,
      eventName: req.query.eventName,
      limit: parseInt(req.query.limit) || 100
    };

    const records = await crowdCountingService.getHistoricalData(filters);

    res.json({ records });
  } catch (error) {
    next(error);
  }
};
