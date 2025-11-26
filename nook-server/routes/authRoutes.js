/*
=======================================================================================================================================
AUTH ROUTES - API endpoints for admin authentication
=======================================================================================================================================
This file defines the URL endpoints for authentication.

Available endpoints:
- POST /api/auth/login - Login with email/username and password
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ===== LOGIN ROUTE =====
// POST /api/auth/login
// Accepts email/username and password, returns JWT token if valid
router.post('/login', authController.login);

module.exports = router;

