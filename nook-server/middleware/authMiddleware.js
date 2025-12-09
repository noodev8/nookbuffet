/*
=======================================================================================================================================
AUTHENTICATION MIDDLEWARE
=======================================================================================================================================
Middleware functions to protect routes and check user roles.

These functions run before the actual route handler and check if the user is authenticated
and has the right permissions.
=======================================================================================================================================
*/

const jwt = require('jsonwebtoken');

// ===== VERIFY JWT TOKEN =====
/**
 * Middleware to verify JWT token from request headers
 * 
 * Checks if the request has a valid JWT token in the Authorization header.
 * If valid, adds the user data to req.user and continues.
 * If invalid, returns an error response.
 * 
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next middleware function
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({
        return_code: 'UNAUTHORIZED',
        message: 'No token provided'
      });
    }
    
    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.substring(7);
    
    // Verify the token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Add user data to request object so other middleware/routes can use it
    req.user = decoded;
    
    // Continue to next middleware/route
    next();
    
  } catch (error) {
    console.error('Token verification error:', error);
    return res.json({
      return_code: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    });
  }
};

// ===== CHECK ROLE =====
/**
 * Middleware factory to check if user has required role
 * 
 * Returns a middleware function that checks if the authenticated user
 * has one of the allowed roles.
 * 
 * Usage: checkRole(['admin', 'manager'])
 * 
 * @param {array} allowedRoles - Array of role strings that are allowed
 * @returns {function} Middleware function
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Make sure user is authenticated first (verifyToken should run before this)
    if (!req.user) {
      return res.json({
        return_code: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }
    
    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.json({
        return_code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource'
      });
    }
    
    // User has the right role, continue
    next();
  };
};

// ===== EXPORTS =====
module.exports = {
  verifyToken,
  checkRole
};

