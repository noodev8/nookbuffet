// Contact Routes - Defines URL endpoints for contact form API
// This file maps URLs to contact controller functions

const express = require('express');
const router = express.Router();

// Import the contact controller
const contactController = require('../controllers/contactController');

/**
 * Route: POST /api/contact
 * Purpose: Send contact form email
 * Example: POST http://localhost:3013/api/contact
 * Body: { name, email, phone, subject, message }
 */
router.post('/', contactController.sendContactEmail);

// Export the router so server.js can use it
module.exports = router;
