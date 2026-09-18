const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Login zaroori hai. Token nahi mila.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User nahi mila. Dobara login karein.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivate hai. Support se rabta karein.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid ya expired token. Dobara login karein.',
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({
    success: false,
    message: 'Sirf admin hi is route ko access kar sakta hai',
  });
};

const verifiedOnly = (req, res, next) => {
  if (req.user && req.user.isPhoneVerified) return next();
  return res.status(403).json({
    success: false,
    message: 'Pehle apna phone verify karein',
  });
};

module.exports = { protect, adminOnly, verifiedOnly };