/*
=======================================================================================================================================
AUTH ROUTES - API endpoints for admin authentication
=======================================================================================================================================
This file defines the URL endpoints for authentication and user management.

ENDPOINTS:

1. POST /api/auth/login
   Purpose: Authenticate an admin user and return a JWT token
   Request Body:
   {
     "email": "admin@example.com",        // string, required - email or username
     "password": "securepassword123"      // string, required - user's password
   }
   Success Response:
   {
     "return_code": "SUCCESS",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "username": "admin",
       "email": "admin@example.com",
       "full_name": "Admin User",
       "role": "admin"
     }
   }
   Return Codes: SUCCESS, MISSING_FIELDS, INVALID_CREDENTIALS, ACCOUNT_DISABLED, SERVER_ERROR

2. GET /api/auth/users (PROTECTED - Manager only)
   Purpose: Get all users for staff management
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Got all users",
     "data": [
       {
         "id": 1,
         "username": "admin",
         "email": "admin@example.com",
         "full_name": "Admin User",
         "role": "admin",
         "is_active": true,
         "last_login": "2024-01-15T10:30:00Z",
         "created_at": "2024-01-01T00:00:00Z"
       }
     ],
     "count": 1
   }
   Return Codes: SUCCESS, UNAUTHORIZED, FORBIDDEN, SERVER_ERROR

3. POST /api/auth/users (PROTECTED - Manager only)
   Purpose: Create a new staff member
   Request Body:
   {
     "username": "newuser",               // string, required - unique username
     "email": "newuser@example.com",      // string, required - unique email
     "password": "securepassword123",     // string, required - user's password
     "full_name": "New User",             // string, required - user's full name
     "role": "staff"                      // string, required - staff, admin, or manager
   }
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "User created successfully",
     "data": {
       "id": 2,
       "username": "newuser",
       "email": "newuser@example.com",
       "full_name": "New User",
       "role": "staff",
       "is_active": true,
       "created_at": "2024-01-15T10:30:00Z"
     }
   }
   Return Codes: SUCCESS, MISSING_FIELDS, INVALID_ROLE, EMAIL_EXISTS, USERNAME_EXISTS, UNAUTHORIZED, FORBIDDEN, SERVER_ERROR

4. PUT /api/auth/users/:id (PROTECTED - Manager only)
   Purpose: Update an existing user's details
   URL Parameters: id (integer, required) - the user ID
   Request Body (all fields optional):
   {
     "username": "updateduser",           // string, optional - new username
     "email": "updated@example.com",      // string, optional - new email
     "password": "newpassword123",        // string, optional - new password
     "full_name": "Updated Name",         // string, optional - new full name
     "role": "admin",                     // string, optional - new role
     "is_active": false                   // boolean, optional - active status
   }
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "User updated successfully",
     "data": {
       "id": 2,
       "username": "updateduser",
       "email": "updated@example.com",
       "full_name": "Updated Name",
       "role": "admin",
       "is_active": false,
       "last_login": "2024-01-15T10:30:00Z",
       "created_at": "2024-01-01T00:00:00Z"
     }
   }
   Return Codes: SUCCESS, USER_NOT_FOUND, INVALID_ROLE, EMAIL_EXISTS, USERNAME_EXISTS, UNAUTHORIZED, FORBIDDEN, SERVER_ERROR

5. DELETE /api/auth/users/:id (PROTECTED - Manager only)
   Purpose: Delete a user from the system
   URL Parameters: id (integer, required) - the user ID
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "User deleted successfully"
   }
   Return Codes: SUCCESS, USER_NOT_FOUND, CANNOT_DELETE_SELF, UNAUTHORIZED, FORBIDDEN, SERVER_ERROR

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

