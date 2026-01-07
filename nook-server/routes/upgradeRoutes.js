/*
=======================================================================================================================================
UPGRADE ROUTES - API endpoints for buffet upgrades
=======================================================================================================================================
handles routes for upgrades - add-ons like dessert packages, drink upgrades etc
that customers can add to their buffet for an extra cost per person

ENDPOINTS:

1. GET /api/upgrades
   Purpose: Get all active upgrades
   Response: { return_code, message, data: [...upgrades], count }

2. GET /api/upgrades/buffet/:buffetId
   Purpose: Get upgrades available for a specific buffet
   URL Parameters: buffetId (integer) - the buffet version ID
   Response: { return_code, message, data: [...upgrades], count }

3. GET /api/upgrades/:id/full
   Purpose: Get upgrade with all categories and items (for order page)
   URL Parameters: id (integer) - the upgrade ID
   Response: { return_code, message, data: { upgrade with categories and items } }

=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();

const upgradeController = require('../controllers/upgradeController');

// GET all upgrades
router.get('/', upgradeController.getAllUpgrades);

// GET upgrades for a specific buffet
router.get('/buffet/:buffetId', upgradeController.getUpgradesForBuffet);

// GET upgrade with all categories and items
router.get('/:id/full', upgradeController.getUpgradeWithItems);

module.exports = router;

