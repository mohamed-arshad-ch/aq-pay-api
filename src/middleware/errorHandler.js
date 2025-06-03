/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error
  let error = {
    status: 'error',
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error'
  };

  // Prisma errors
  if (err.code === 'P2002') {
    error.statusCode = 400;
    error.message = 'A record with this data already exists';
  } else if (err.code === 'P2025') {
    error.statusCode = 404;
    error.message = 'Record not found';
  } else if (err.code && err.code.startsWith('P')) {
    error.statusCode = 400;
    error.message = 'Database operation failed';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token expired';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.message = err.message;
  }

  // Send error response
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler; 