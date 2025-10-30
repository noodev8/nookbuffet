/*
=======================================================================================================================================
CONTACT ROUTES - API endpoint for contact form submissions
=======================================================================================================================================
Routes are like the "front desk" of your API. They receive requests from the website and send them
to the right controller to handle.

This route handles contact form submissions and sends emails.

ENDPOINT:

POST /api/contact
Purpose: Sends a contact form submission via email
Validates required fields and email format before sending.

Request Payload:
{
  "name": "John Doe",                    // string, required - person's name
  "email": "john@example.com",           // string, required - person's email
  "phone": "01234 567890",               // string, optional - person's phone number
  "subject": "Catering Inquiry",         // string, optional - email subject
  "message": "I would like to inquire..." // string, required - the message content
}

Success Response:
{
  "return_code": "SUCCESS",
  "message": "Your message has been sent! We will get back to you soon."
}

Error Response Examples:

Missing required fields:
{
  "return_code": "MISSING_FIELDS",
  "message": "Please fill out name, email, and message"
}

Invalid email format:
{
  "return_code": "INVALID_EMAIL",
  "message": "Please enter a valid email address"
}

Email service error:
{
  "return_code": "SERVER_ERROR",
  "message": "Sorry, there was a problem sending your message. Please try again."
}

Return Codes:
- "SUCCESS" - Email sent successfully
- "MISSING_FIELDS" - Required fields (name, email, message) are missing
- "INVALID_EMAIL" - Email format is invalid
- "SERVER_ERROR" - Email service failed or unexpected error occurred

=======================================================================================================================================
*/

const express = require('express');  // Express library for routing
const router = express.Router();     // Create a new router object

// Import the contact controller - this has the function that handles contact form submissions
const contactController = require('../controllers/contactController');

// ===== ROUTE: SEND CONTACT EMAIL =====
// When someone POSTs to /api/contact, run the sendContactEmail function
// POST is used because we're sending data (the form submission)
router.post('/', contactController.sendContactEmail);

// ===== EXPORTS =====
// Make this router available to server.js
module.exports = router;
