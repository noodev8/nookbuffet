/*
=======================================================================================================================================
BUFFET VERSION ROUTES - API endpoints for buffet version data
=======================================================================================================================================
Routes are like the "front desk" of your API. They receive requests from the website and send them
to the right controller to handle.

ENDPOINTS:

1. GET /api/buffet-versions
   Purpose: Retrieve all active buffet versions
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Got all buffet versions!",
     "data": [
       {
         "id": 1,
         "title": "Standard Buffet",
         "description": "Our standard buffet offering",
         "price_per_person": 15.99,
         "is_active": true,
         "created_at": "2024-01-01T00:00:00Z"
       }
     ],
     "count": 1
   }
   Return Codes: SUCCESS, SERVER_ERROR

2. GET /api/buffet-versions/:id
   Purpose: Retrieve a specific buffet version by ID
   URL Parameters: id (integer, required)
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Found the buffet version!",
     "data": {
       "id": 1,
       "title": "Standard Buffet",
       "description": "Our standard buffet offering",
       "price_per_person": 15.99,
       "is_active": true,
       "created_at": "2024-01-01T00:00:00Z"
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

