/*
=======================================================================================================================================
CUSTOMER ROUTES - API endpoints for customer accounts
=======================================================================================================================================
POST /api/customers/register - create a new customer account
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Register a new customer account
router.post('/register', customerController.register);

module.exports = router;

