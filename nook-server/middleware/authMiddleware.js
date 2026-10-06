/*
=======================================================================================================================================
AUTHENTICATION MIDDLEWARE
=======================================================================================================================================
Middleware functions to protect routes and check user roles.

These functions run before the actual route handler and check if the user is authenticated
and has the right permissions.

There are three kinds of token:
  - admin portal logins:     { userId, email, role }                  (POST /api/auth/login)
  - customer website logins: { id, email, type: 'customer' }          (POST /api/customers/login)
  - staff website logins:    { id, email, role, type: 'staff' }       (POST /api/auth/staff-web-login)
Only admin portal tokens can use the admin routes (checkRole).
=======================================================================================================================================
*/

const jwt = require('jsonwebtoken');

// The secret every token is signed and checked with
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set - using an insecure default. Set it in .env before going live.');
}

// Reads and checks the "Bearer <token>" header. Returns the token's data, or null.
const readToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.substring(7), JWT_SECRET);
  } catch {
    return null;
  }
};

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
  const user = readToken(req);
  if (!user) {
    return res.json({
      return_code: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    });
  }

  // Add user data to request object so other middleware/routes can use it
  req.user = user;
  next();
};

// ===== OPTIONAL TOKEN =====
// For public routes that do a little more for a logged-in user (e.g. placing an order
// links it to the customer's account). Sets req.user if there's a valid token, never blocks.
const optionalToken = (req, res, next) => {
  req.user = readToken(req);
  next();
};

// ===== CHECK ROLE =====
/**
 * Middleware to check if user has required role
 *
 * Returns a middleware function that checks if the authenticated user
 * has one of the allowed roles. Only admin portal tokens count - website
 * logins (customer or staff) can't use the admin routes.
 *
 * Usage: checkRole(['admin'])
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

    // Check this is an admin portal login with one of the allowed roles
    if (req.user.type || !allowedRoles.includes(req.user.role)) {
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
  JWT_SECRET,
  verifyToken,
  optionalToken,
  checkRole
};
