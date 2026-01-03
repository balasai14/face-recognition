const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email or username already exists',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    const token = generateToken(user._id);

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Please provide email and password',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          timestamp: new Date().toISOString()
        }
      });
    }

    const token = generateToken(user._id);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
exports.verify = async (req, res, next) => {
  try {
    res.json({
      valid: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
