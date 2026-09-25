/*
=======================================================================================================================================
SANDWICH ROUTES - API endpoints for the build-your-own sandwich menu
=======================================================================================================================================
All routes are admin only. Every response has a return_code; errors also have a message.
Common return codes: SUCCESS, INVALID_ID, INVALID_DATA, NOT_FOUND, UNAUTHORIZED, FORBIDDEN, SERVER_ERROR

A step looks like:
{
  "id": 1,
  "name": "Bread",                    // string
  "description": null,                // string or null - shown to customers
  "min_choices": 1,                   // integer, 0 = optional
  "max_choices": 1,                   // integer, or null for no limit
  "position": 0,                      // integer, order the steps are shown in
  "options": [ ...options ]           // only on GET /manage
}

An option looks like:
{
  "id": 7,
  "step_id": 1,
  "name": "White bloomer",            // string
  "description": null,                // string or null
  "extra_price": "0.00",              // string (numeric), added to the base price
  "is_active": true                   // boolean, false = out of stock
}

ENDPOINTS:

1. GET /api/sandwiches/manage
   Purpose: The whole sandwich menu for the admin portal, including out-of-stock options
   Success Response: { return_code, data: { settings: { base_price: "5.00", enabled: false }, steps: [...] } }

2. PATCH /api/sandwiches/manage/settings
   Request Body: { "base_price": 5.00, "enabled": true }   // number >= 0, boolean - both required
   Success Response: { return_code, data: { base_price, enabled } }

3. POST /api/sandwiches/manage/steps
   Request Body: { "name": "Bread", "description": null, "min_choices": 1, "max_choices": 1 }
   Success Response: { return_code, data: step }

4. PATCH /api/sandwiches/manage/steps/reorder
   Request Body: [ { "id": 1, "position": 0 }, { "id": 2, "position": 1 } ]

5. PATCH /api/sandwiches/manage/steps/:id
   Request Body: same as creating a step
   Success Response: { return_code, data: step }

6. DELETE /api/sandwiches/manage/steps/:id
   Purpose: Remove a step and its options (soft delete)

7. POST /api/sandwiches/manage/steps/:id/options
   Request Body: { "name": "Ham", "description": null, "extra_price": 0.50 }   // extra_price optional, defaults to 0
   Success Response: { return_code, data: option }

8. PATCH /api/sandwiches/manage/options/:id
   Request Body: same as creating an option
   Success Response: { return_code, data: option }

9. PATCH /api/sandwiches/manage/options/:id/stock
   Request Body: { "is_active": false }
   Success Response: { return_code, data: option }

10. DELETE /api/sandwiches/manage/options/:id
    Purpose: Remove an option (soft delete)

=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();
const sandwichController = require('../controllers/sandwichController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const admin = [verifyToken, checkRole(['admin'])];

router.get('/manage', admin, sandwichController.getMenuForManagement);
router.patch('/manage/settings', admin, sandwichController.updateSettings);

// reorder must come before /:id so "reorder" isn't treated as an ID
router.post('/manage/steps', admin, sandwichController.createStep);
router.patch('/manage/steps/reorder', admin, sandwichController.reorderSteps);
router.patch('/manage/steps/:id', admin, sandwichController.updateStep);
router.delete('/manage/steps/:id', admin, sandwichController.deleteStep);

router.post('/manage/steps/:id/options', admin, sandwichController.createOption);
router.patch('/manage/options/:id', admin, sandwichController.updateOption);
router.patch('/manage/options/:id/stock', admin, sandwichController.setOptionStock);
router.delete('/manage/options/:id', admin, sandwichController.deleteOption);

module.exports = router;
