const individualAuthService = require('../services/individualAuthService');
const logger = require('../utils/logger');

// @desc    Register individual with face images
// @route   POST /api/individual/register
// @access  Private
exports.register = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: {
          code: 'NO_FILES',
          message: 'Please upload at least one image',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (req.files.length < 5) {
      return res.status(400).json({
        error: {
          code: 'INSUFFICIENT_IMAGES',
          message: 'Please upload at least 5 images for registration',
          timestamp: new Date().toISOString()
        }
      });
    }

    const metadata = {
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      department: req.body.department
    };

    const result = await individualAuthService.registerUser(
      req.user._id,
      req.files,
      metadata
    );

    logger.info(`Individual registered: ${req.user._id}`);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate individual
// @route   POST /api/individual/authenticate
// @access  Private
exports.authenticate = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'Please upload an image',
          timestamp: new Date().toISOString()
        }
      });
    }

    const result = await individualAuthService.authenticateUser(req.file.buffer);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/individual/:userId
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await individualAuthService.getUserProfile(req.params.userId);

    if (!profile) {
      return res.status(404).json({
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user profile
// @route   DELETE /api/individual/:userId
// @access  Private/Admin
exports.deleteProfile = async (req, res, next) => {
  try {
    const result = await individualAuthService.deleteUser(req.params.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
