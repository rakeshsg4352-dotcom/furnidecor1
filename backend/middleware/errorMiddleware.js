// middleware/errorMiddleware.js
// Centralized error handling so we don't repeat try/catch boilerplate
// with different error responses in every controller.

// Wraps an async route handler. If the handler throws or rejects,
// this automatically forwards the error to Express's error handler
// instead of crashing the server or requiring a try/catch everywhere.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Handles requests to routes that don't exist (404)
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Final error handler — catches anything passed via next(error)
// and sends a clean JSON response instead of an HTML stack trace page.
const errorHandler = (err, req, res, next) => {
  // If status was already set (e.g. 404), use it; otherwise default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(err.stack); // full details in our terminal for debugging

  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server.',
    // Only show stack trace in development, never in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { asyncHandler, notFound, errorHandler };