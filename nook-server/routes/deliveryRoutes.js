/*
=======================================================================================================================================
DELIVERY ROUTES - API endpoints for delivery area validation
=======================================================================================================================================
Routes for validating customer delivery addresses against branch locations.
Uses Mapbox API to calculate accurate road distances from branches to customer addresses.

ENDPOINTS:

1. POST /api/delivery/validate-area
   Purpose: Validate if customer address is within delivery range of any branch
   Request Body:
   {
     "address": "123 Main St, London"              // string, required - customer's full address
   }
   Success Response:
   {
     "return_code": "SUCCESS",
     "data": {
       "isWithinRange": true,                      // boolean, whether address is within delivery range
       "branch": {
         "id": 1,                                  // integer, branch ID
         "name": "Main Branch",                    // string, branch name
         "address": "456 High St, London"          // string, branch address
       },
       "distanceMiles": 5.2,                       // decimal, road distance in miles
       "durationMinutes": 15,                      // integer, estimated drive time in minutes
       "deliveryRadius": 7                         // decimal, maximum delivery radius in miles
     }
   }
   Error Response Examples:
   {
     "return_code": "MISSING_FIELDS",
     "message": "Address is required"
   }
   {
     "return_code": "INVALID_ADDRESS",
     "message": "Could not find the provided address"
   }
   {
     "return_code": "NO_BRANCHES",
     "message": "No active branches available"
   }
   {
     "return_code": "DISTANCE_CALCULATION_FAILED",
     "message": "Could not calculate distance to branch"
   }
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