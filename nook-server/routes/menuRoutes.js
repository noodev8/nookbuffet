// Menu Routes - Defines URL endpoints for menu API
// This file maps URLs to controller functions

const express = require('express');
const router = express.Router();

// Import the menu controller
const menuController = require('../controllers/menuController');

/**
 * Route: GET /api/menu
 * Purpose: Get all menu sections with their items
 * Example: http://localhost:3013/api/menu
 */
router.get('/', menuController.getAllMenuSections);

/**
 * Route: GET /api/menu/formatted
 * Purpose: Get menu sections formatted specifically for frontend
 * Example: http://localhost:3013/api/menu/formatted
 */
router.get('/formatted', menuController.getFormattedMenuSections);

/**
 * Route: GET /api/menu/:id
 * Purpose: Get a specific menu section by ID
 * Example: http://localhost:3013/api/menu/1
 * Note: This route must come AFTER /formatted to avoid conflicts
 */
router.get('/:id', menuController.getMenuSectionById);

// Export the router so server.js can use it
module.exports = router;
