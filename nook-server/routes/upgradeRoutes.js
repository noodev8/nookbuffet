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
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// GET all upgrades
router.get('/', upgradeController.getAllUpgrades);

// GET upgrades for a specific buffet
router.get('/buffet/:buffetId', upgradeController.getUpgradesForBuffet);

// ===== MANAGEMENT ROUTES (protected) =====
const mgmt = ['admin', 'manager'];

// GET all upgrades with categories and items (for menu builder)
router.get('/manage', verifyToken, checkRole(mgmt), upgradeController.getAllUpgradesForManagement);

// POST create a new upgrade
router.post('/manage', verifyToken, checkRole(mgmt), upgradeController.createUpgrade);

// PATCH update an upgrade
router.patch('/manage/:id', verifyToken, checkRole(mgmt), upgradeController.updateUpgrade);

// GET buffet versions with is_linked flag for a specific upgrade
router.get('/manage/:upgradeId/buffets', verifyToken, checkRole(mgmt), upgradeController.getBuffetVersionLinksForUpgrade);

// POST create a category inside an upgrade
router.post('/manage/:upgradeId/categories', verifyToken, checkRole(mgmt), upgradeController.createUpgradeCategory);

// PATCH update an upgrade category
router.patch('/manage/categories/:catId', verifyToken, checkRole(mgmt), upgradeController.updateUpgradeCategory);

// POST create an item inside a category
router.post('/manage/categories/:catId/items', verifyToken, checkRole(mgmt), upgradeController.createUpgradeItem);

// PATCH update an upgrade item
router.patch('/manage/items/:itemId', verifyToken, checkRole(mgmt), upgradeController.updateUpgradeItem);

// Buffet ↔ upgrade link management
router.get('/manage/buffet/:buffetId', verifyToken, checkRole(mgmt), upgradeController.getBuffetUpgradeLinks);
router.post('/manage/buffet/:buffetId/upgrade/:upgradeId', verifyToken, checkRole(mgmt), upgradeController.linkUpgradeToBuffet);
router.delete('/manage/buffet/:buffetId/upgrade/:upgradeId', verifyToken, checkRole(mgmt), upgradeController.unlinkUpgradeFromBuffet);

// GET upgrade with all categories and items
router.get('/:id/full', upgradeController.getUpgradeWithItems);

module.exports = router;

