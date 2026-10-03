const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

// Protect routes: verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Not authorized without an authentication token.',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'secret_key_microloan_itm_2026';
    const decoded = jwt.verify(token, jwtSecret);

    const member = await Member.findById(decoded.id);

    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this token no longer exists.',
      });
    }

    if (!member.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact the Head Branch.',
      });
    }

    req.user = member;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or token has expired.',
      error: err.message,
    });
  }
};

// Grant access to specific roles (e.g. 'admin', 'subadmin', 'user')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this endpoint. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
