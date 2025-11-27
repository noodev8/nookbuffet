/*
=======================================================================================================================================
AUTH ROUTES - API endpoints for admin authentication
=======================================================================================================================================
This file defines the URL endpoints for authentication.

Available endpoints:
- POST /api/auth/login - Login with email/username and password
- GET /api/auth/users - Get all users (manager only)
- POST /api/auth/users - Create a new user (manager only)
- PUT /api/auth/users/:id - Update a user (manager only)
- DELETE /api/auth/users/:id - Delete a user (manager only)
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Import auth middleware for protected routes
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ===== LOGIN ROUTE =====
// POST /api/auth/login
// Accepts email/username and password, returns JWT token if valid
router.post('/login', authController.login);

// ===== GET ALL USERS ROUTE (PROTECTED) =====
// GET /api/auth/users
// Returns all users - only managers can access this
router.get('/users', verifyToken, checkRole(['manager']), authController.getAllUsers);

// ===== CREATE USER ROUTE (PROTECTED) =====
// POST /api/auth/users
// Creates a new user - only managers can do this
router.post('/users', verifyToken, checkRole(['manager']), authController.createUser);

// ===== UPDATE USER ROUTE (PROTECTED) =====
// PUT /api/auth/users/:id
// Updates an existing user - only managers can do this
router.put('/users/:id', verifyToken, checkRole(['manager']), authController.updateUser);

// ===== DELETE USER ROUTE (PROTECTED) =====
// DELETE /api/auth/users/:id
// Deletes a user - only managers can do this
router.delete('/users/:id', verifyToken, checkRole(['manager']), authController.deleteUser);

module.exports = router;

