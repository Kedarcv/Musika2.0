const asyncHandler = require('express-async-handler');
const { auth } = require('../config/firebase-admin');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decodedToken = await auth.verifyIdToken(token);
      
      // Get user from Firestore
      const user = await auth.getUser(decodedToken.uid);
      
      // Add user to request object
      req.user = {
        id: user.uid,
        email: user.email,
        role: decodedToken.role || 'customer'
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Not authorized for this role');
    }
    next();
  };
};

module.exports = { protect, authorize };
