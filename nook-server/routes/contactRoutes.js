// This file creates the URL route for the contact form
// When someone submits the contact form, it goes to /api/contact

const express = require('express');
const router = express.Router();

// Get the email sending function
const contactController = require('../controllers/contactController');

// When someone POSTs to /api/contact, run the email function
router.post('/', contactController.sendContactEmail);

// Export so server.js can use this route
module.exports = router;
