/*
=======================================================================================================================================
BUFFET VERSION ROUTES - API endpoints for buffet version data
=======================================================================================================================================
Routes are like the "front desk" of your API. They receive requests from the website and send them
to the right controller to handle.

This route handles buffet versions - these are the different buffet packages customers can choose from
(like "Standard Buffet", "Premium Buffet", etc.) with their pricing information.

ENDPOINTS:

1. GET /api/buffet-versions
   Purpose: Retrieve all active buffet versions
   Request Body: None
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Got all buffet versions!",
     "data": [
       {
         "id": 1,                                    // integer, unique buffet version ID
         "title": "Standard Buffet",                 // string, buffet version name
         "description": "Our standard buffet offering", // string, description
         "price_per_person": 15.99,                  // decimal, price per person in GBP
         "is_active": true,                          // boolean, whether version is active
         "created_at": "2024-01-01T00:00:00Z"        // timestamp, when created
       }
     ],
     "count": 1                                      // integer, number of versions returned
   }
   Return Codes: SUCCESS, SERVER_ERROR

2. GET /api/buffet-versions/:id
   Purpose: Retrieve a specific buffet version by ID
   URL Parameters: id (integer, required) - the buffet version ID
   Request Body: None
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Found the buffet version!",
     "data": {
       "id": 1,                                    // integer, unique buffet version ID
       "title": "Standard Buffet",                 // string, buffet version name
       "description": "Our standard buffet offering", // string, description
       "price_per_person": 15.99,                  // decimal, price per person in GBP
       "is_active": true,                          // boolean, whether version is active
       "created_at": "2024-01-01T00:00:00Z"        // timestamp, when created
     }
   }
   Return Codes: SUCCESS, INVALID_ID, NOT_FOUND, SERVER_ERROR

=======================================================================================================================================
*/

const express = require('express');  // Express library for routing
const router = express.Router();     // Create a new router object

// Import the buffet version controller - this has all the functions that handle buffet version requests
const buffetVersionController = require('../controllers/buffetVersionController');

// ===== ROUTE 1: GET ALL BUFFET VERSIONS =====
// When someone visits /api/buffet-versions, run the getAllBuffetVersions function
router.get('/', buffetVersionController.getAllBuffetVersions);

// ===== ROUTE 2: GET ONE SPECIFIC BUFFET VERSION =====
// When someone visits /api/buffet-versions/1 (or any number), run the getBuffetVersionById function
// The :id is a parameter - it can be any number
// NOTE: This must come AFTER any other specific routes
router.get('/:id', buffetVersionController.getBuffetVersionById);

// ===== EXPORTS =====
// Make this router available to server.js
module.exports = router;

