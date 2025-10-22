// This file creates the URL routes for the menu
// When someone visits these URLs, it runs the menu functions

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
