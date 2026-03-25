/*
=======================================================================================================================================
CUSTOMER ROUTES - API endpoints for customer accounts
=======================================================================================================================================
POST /api/customers/register - create a new customer account
POST /api/customers/login    - log in with email and password
PUT  /api/customers/profile  - update the logged-in customer's profile (requires token)
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken } = require('../middleware/authMiddleware');

// Register a new customer account
router.post('/register', customerController.register);

// Log in with email and password
router.post('/login', customerController.login);

// Update the logged-in customer's profile
router.put('/profile', verifyToken, customerController.updateProfile);

module.exports = router;

