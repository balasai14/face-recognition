const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized to access this route',
          timestamp: new Date().toISOString()
        }
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            timestamp: new Date().toISOString()
          }
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'User role not authorized to access this route',
          timestamp: new Date().toISOString()
        }
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
