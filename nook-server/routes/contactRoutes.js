/*
=======================================================================================================================================
API Route: send_contact_email
=======================================================================================================================================
Method: POST
Purpose: Sends a contact form submission via email. Validates required fields and email format before sending.
=======================================================================================================================================
Request Payload:
{
  "name": "John Doe",                    // string, required
  "email": "john@example.com",           // string, required
  "phone": "01234 567890",               // string, optional
  "subject": "Catering Inquiry",         // string, optional
  "message": "I would like to inquire..." // string, required
}

Success Response:
{
  "return_code": "SUCCESS",
  "message": "Your message has been sent! We will get back to you soon."
}

Error Response Examples:
{
  "return_code": "MISSING_FIELDS",
  "message": "Please fill out name, email, and message"
}

{
  "return_code": "INVALID_EMAIL",
  "message": "Please enter a valid email address"
}

{
  "return_code": "SERVER_ERROR",
  "message": "Sorry, there was a problem sending your message. Please try again."
}

=======================================================================================================================================
Return Codes:
"SUCCESS" - Email sent successfully
"MISSING_FIELDS" - Required fields (name, email, message) are missing
"INVALID_EMAIL" - Email format is invalid
"SERVER_ERROR" - Email service failed or unexpected error occurred
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();

// Get the email sending function
const contactController = require('../controllers/contactController');

// When someone POSTs to /api/contact, run the email function
router.post('/', contactController.sendContactEmail);

// Export so server.js can use this route
module.exports = router;
