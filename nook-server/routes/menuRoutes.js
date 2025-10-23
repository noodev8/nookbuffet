/*
=======================================================================================================================================
API Routes: Menu Management
=======================================================================================================================================
Purpose: Handles all menu-related API endpoints for retrieving menu sections and items
=======================================================================================================================================

ENDPOINTS:

1. GET /api/menu
   Purpose: Retrieve all menu sections with their items
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Got the menu!",
     "data": [
       {
         "id": 1,
         "name": "Sandwiches",
         "description": "Fresh sandwiches",
         "items": [...]
       }
     ],
     "count": 5
   }
   Return Codes: SUCCESS, SERVER_ERROR

2. GET /api/menu/formatted
   Purpose: Retrieve all menu sections in formatted structure for frontend
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Got formatted menu data!",
     "sections": [
       {
         "id": 1,
         "title": "Sandwiches",
         "description": "Fresh sandwiches",
         "image": "url",
         "items": [...]
       }
     ]
   }
   Return Codes: SUCCESS, SERVER_ERROR

3. GET /api/menu/:id
   Purpose: Retrieve a specific menu section by ID
   URL Parameters: id (integer, required)
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Found the menu section!",
     "data": {
       "id": 1,
       "name": "Sandwiches",
       "description": "Fresh sandwiches",
       "items": [...]
     }
   }
   Return Codes: SUCCESS, INVALID_ID, NOT_FOUND, SERVER_ERROR

=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();

// Get the menu functions
const menuController = require('../controllers/menuController');

// When someone goes to /api/menu, show all menu sections
router.get('/', menuController.getAllMenuSections);

// When someone goes to /api/menu/formatted, show formatted menu data
router.get('/formatted', menuController.getFormattedMenuSections);

// When someone goes to /api/menu/1 (or any number), show that specific section
// Note: This must come AFTER /formatted so it doesn't interfere
router.get('/:id', menuController.getMenuSectionById);

// Export so server.js can use these routes
module.exports = router;
