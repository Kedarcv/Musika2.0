// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(err.stack);

  // Get status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Send error response
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    // Additional error details if available
    errors: err.errors || null,
    code: err.code || null,
  });
};

// 404 Not Found Middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Async Handler Wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation Error Handler
const handleValidationError = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    res.status(400).json({
      message: 'Validation Error',
      errors,
    });
  } else {
    next(err);
  }
};

// JWT Error Handler
const handleJWTError = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      message: 'Invalid token. Please log in again.',
    });
  } else if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      message: 'Your token has expired. Please log in again.',
    });
  } else {
    next(err);
  }
};

// Database Error Handler
const handleDBError = (err, req, res, next) => {
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // Handle duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      res.status(400).json({
        message: `A record with this ${field} already exists.`,
        field,
      });
    } else {
      res.status(500).json({
        message: 'Database error occurred.',
        code: err.code,
      });
    }
  } else {
    next(err);
  }
};

// Rate Limit Error Handler
const handleRateLimitError = (err, req, res, next) => {
  if (err.status === 429) {
    res.status(429).json({
      message: 'Too many requests. Please try again later.',
      retryAfter: err.retryAfter || 60, // seconds
    });
  } else {
    next(err);
  }
};

// File Upload Error Handler
const handleFileUploadError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      message: 'File is too large. Maximum size is 5MB.',
    });
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({
      message: 'Invalid file type.',
    });
  } else {
    next(err);
  }
};

// Socket Connection Error Handler
const handleSocketError = (err, req, res, next) => {
  if (err.name === 'SocketError') {
    res.status(500).json({
      message: 'Real-time communication error occurred.',
      details: err.message,
    });
  } else {
    next(err);
  }
};

// Payment Processing Error Handler
const handlePaymentError = (err, req, res, next) => {
  if (err.type === 'StripeError') {
    res.status(400).json({
      message: 'Payment processing error.',
      details: err.message,
      code: err.code,
    });
  } else {
    next(err);
  }
};

// Custom Error Classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = [];
  }

  addError(field, message) {
    this.errors.push({ field, message });
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation Error',
        details: error.details,
      });
    }
    next();
  };
};

module.exports = {
  validateRequest,
  errorHandler,
  notFound,
  asyncHandler,
  handleValidationError,
  handleJWTError,
  handleDBError,
  handleRateLimitError,
  handleFileUploadError,
  handleSocketError,
  handlePaymentError,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
};
