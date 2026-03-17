/*
=======================================================================================================================================
CUSTOMER ROUTES - API endpoints for customer accounts
=======================================================================================================================================
POST /api/customers/register - create a new customer account
POST /api/customers/login    - log in with email and password
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Register a new customer account
router.post('/register', customerController.register);

// Log in with email and password
router.post('/login', customerController.login);

module.exports = router;

