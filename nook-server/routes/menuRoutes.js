/*
=======================================================================================================================================
MENU ROUTES - API endpoints for menu data
=======================================================================================================================================
Routes are like the "front desk" of your API. They receive requests from the website and send them
to the right controller to handle.

Think of it like a restaurant:
- Website makes a request (like "give me the menu")
- Route receives it and says "okay, I'll send you to the menu controller"
- Controller handles it and sends back the data

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

3. GET /api/menu/buffet-version/:id
   Purpose: Retrieve menu sections filtered by buffet version ID
   URL Parameters: id (integer, required) - the buffet version ID
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Got menu sections for buffet version!",
     "data": [
       {
         "id": 1,
         "name": "Sandwiches",
         "description": "Fresh sandwiches",
         "buffet_version_id": 1,
         "items": [...]
       }
     ],
     "count": 5
   }
   Return Codes: SUCCESS, INVALID_ID, SERVER_ERROR

4. GET /api/menu/:id
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

const express = require('express');  // Express library for routing
const router = express.Router();     // Create a new router object

// Import the menu controller - this has all the functions that handle menu requests
const menuController = require('../controllers/menuController');

// ===== ROUTE 1: GET ALL MENU SECTIONS =====
// When someone visits /api/menu, run the getAllMenuSections function
router.get('/', menuController.getAllMenuSections);

// ===== ROUTE 2: GET FORMATTED MENU SECTIONS =====
// When someone visits /api/menu/formatted, run the getFormattedMenuSections function
// NOTE: This must come BEFORE the /:id route so it doesn't get confused
// (otherwise /formatted would be treated as an ID)
router.get('/formatted', menuController.getFormattedMenuSections);

// ===== ROUTE 3: GET MENU SECTIONS BY BUFFET VERSION =====
// When someone visits /api/menu/buffet-version/1 (or any number), run the getMenuSectionsByBuffetVersion function
// NOTE: This must come BEFORE the /:id route so it doesn't get confused
router.get('/buffet-version/:id', menuController.getMenuSectionsByBuffetVersion);

// ===== ROUTE 4: GET ONE SPECIFIC MENU SECTION =====
// When someone visits /api/menu/1 (or any number), run the getMenuSectionById function
// The :id is a parameter - it can be any number
// NOTE: This must come AFTER /formatted and /buffet-version so it doesn't interfere
router.get('/:id', menuController.getMenuSectionById);

// ===== EXPORTS =====
// Make this router available to server.js
module.exports = router;
