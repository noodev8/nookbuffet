/*
=======================================================================================================================================
DELIVERY ROUTES - API endpoints for delivery area validation
=======================================================================================================================================
Routes for validating customer delivery addresses against branch locations.

ENDPOINTS:
1. POST /api/delivery/validate-area
   Purpose: Validate if customer address is within delivery range
   Request Body: { "address": "123 Main St, London" }
   Return Codes: SUCCESS, MISSING_FIELDS, INVALID_ADDRESS, NO_BRANCHES, 
                DISTANCE_CALCULATION_FAILED, SERVER_ERROR
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();

const deliveryController = require('../controllers/deliveryController');

// ===== ROUTE: VALIDATE DELIVERY AREA =====
router.post('/validate-area', deliveryController.validateDeliveryArea);

module.exports = router;