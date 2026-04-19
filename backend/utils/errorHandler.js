/**
 * Centralized error handling utility
 * Wraps async route handlers to catch and log errors consistently
 */

/**
 * Catch errors from async route handlers and pass to Express error handler
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware that catches errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Log detailed error information
    console.error(`\n❌ ERROR: ${req.method} ${req.originalUrl}`);
    console.error(`   Status: ${error.status || error.statusCode || 500}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || "UNKNOWN"}`);
    if (process.env.NODE_ENV === "development" && error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
    console.error("---");

    // Pass to global error handler
    next(error);
  });
};

/**
 * Format error response for API
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
const formatErrorResponse = (error) => {
  const status = error.status || error.statusCode || 500;
  const message = error.message || "Internal server error";
  const code = error.code || "INTERNAL_ERROR";

  return {
    success: false,
    status,
    message,
    code,
    ...(process.env.NODE_ENV === "development" && { 
      details: error.message,
      stack: error.stack 
    }),
  };
};

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array<string>} required - Required field names
 * @returns {Object|null} Error object if validation fails, null if valid
 */
const validateRequired = (body, required) => {
  const missing = required.filter(field => !body[field]);
  if (missing.length > 0) {
    return new Error(`Missing required fields: ${missing.join(", ")}`);
  }
  return null;
};

/**
 * Create a custom API error
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code for frontend
 * @returns {Error} Custom error object
 */
const createApiError = (message, statusCode = 500, code = "API_ERROR") => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

module.exports = {
  asyncHandler,
  formatErrorResponse,
  validateRequired,
  createApiError,
};
