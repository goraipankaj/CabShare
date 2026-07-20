const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid value for field '${error.path}'`;
    }
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0];
      message = `Duplicate value for field '${field}'`;
    }
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(error.errors).map((e) => e.message).join(', ');
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Invalid or expired token';
    }

    error = new ApiError(statusCode, message);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
