/*
=======================================================================================================================================
MENU ROUTES - API endpoints for menu data
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

2. GET /api/menu/buffet-version/:id
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

=======================================================================================================================================
*/

const express = require('express');  // Express library for routing
const router = express.Router();     // Create a new router object

// Import the menu controller - this has all the functions that handle menu requests
const menuController = require('../controllers/menuController');

// Import auth middleware for protected routes
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ===== ROUTE 1: GET ALL MENU SECTIONS =====
// When someone visits /api/menu, run the getAllMenuSections function
router.get('/', menuController.getAllMenuSections);

// ===== ROUTE 2: GET MENU SECTIONS BY BUFFET VERSION =====
// When someone visits /api/menu/buffet-version/1 (or any number), run the getMenuSectionsByBuffetVersion function
router.get('/buffet-version/:id', menuController.getMenuSectionsByBuffetVersion);

// ===== ROUTE 3: GET ALL MENU ITEMS FOR MANAGEMENT (PROTECTED) =====
// When someone visits /api/menu/manage, run the getAllMenuItemsForManagement function
// Only admin and manager roles can access this
router.get('/manage', verifyToken, checkRole(['admin', 'manager']), menuController.getAllMenuItemsForManagement);

// ===== ROUTE 4: UPDATE MENU ITEM STOCK STATUS (PROTECTED) =====
// When someone makes a PATCH request to /api/menu/manage/1 (or any item ID), update the stock status
// Only admin and manager roles can access this
router.patch('/manage/:id', verifyToken, checkRole(['admin', 'manager']), menuController.updateMenuItemStockStatus);

// ===== EXPORTS =====
// Make this router available to server.js
module.exports = router;
