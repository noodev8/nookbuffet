/*
=======================================================================================================================================
API Routes: Buffet Versions
=======================================================================================================================================
Purpose: Handles all buffet version API endpoints for retrieving pricing and details
=======================================================================================================================================

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

const express = require('express');
const router = express.Router();

// Get the buffet version functions
const buffetVersionController = require('../controllers/buffetVersionController');

// When someone goes to /api/buffet-versions, show all buffet versions
router.get('/', buffetVersionController.getAllBuffetVersions);

// When someone goes to /api/buffet-versions/1 (or any number), show that specific version
// Note: This must come AFTER any other specific routes
router.get('/:id', buffetVersionController.getBuffetVersionById);

// Export so server.js can use these routes
module.exports = router;

