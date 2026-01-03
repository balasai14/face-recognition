const groupAuthService = require('../services/groupAuthService');
const logger = require('../utils/logger');

// @desc    Authenticate group
// @route   POST /api/group/authenticate
// @access  Private
exports.authenticateGroup = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'Please upload a group image',
          timestamp: new Date().toISOString()
        }
      });
    }

    const { eventId, eventName, location } = req.body;

    if (!eventId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_EVENT_ID',
          message: 'Event ID is required',
          timestamp: new Date().toISOString()
        }
      });
    }

    const result = await groupAuthService.authenticateGroup(
      req.file.buffer,
      eventId,
      eventName,
      location
    );

    logger.info(`Group authenticated for event: ${eventId}`);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance record by event ID
// @route   GET /api/group/attendance/:eventId
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const record = await groupAuthService.getAttendanceRecord(req.params.eventId);

    if (!record) {
      return res.status(404).json({
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'Attendance record not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history
// @route   GET /api/group/attendance/history
// @access  Private
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userId: req.query.userId,
      eventId: req.query.eventId,
      limit: parseInt(req.query.limit) || 100
    };

    const records = await groupAuthService.getAttendanceHistory(filters);

    res.json({ records });
  } catch (error) {
    next(error);
  }
};
