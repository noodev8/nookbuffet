/*
=======================================================================================================================================
ORDER ROUTES - API endpoints for order creation
=======================================================================================================================================
Routes are like the "front desk" of your API. They receive requests from the website and send them
to the right controller to handle.

ENDPOINTS:

1. POST /api/orders
   Purpose: Create a new order with buffets and items
   Request Body:
   {
     "email": "customer@example.com",
     "phone": "+44 1234 567890",
     "businessName": "Acme Corp",
     "address": "123 Main St, City",
     "fulfillmentType": "delivery",
     "deliveryDate": "2024-01-15",
     "deliveryTime": "12:00",
     "totalPrice": 109.00,
     "buffets": [
       {
         "buffetVersionId": 1,
         "numPeople": 10,
         "pricePerPerson": 10.90,
         "totalPrice": 109.00,
         "items": [1, 2, 3, 4, 5],
         "notes": "No nuts please",
         "dietaryInfo": "Vegetarian",
         "allergens": "Dairy"
       }
     ]
   }
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Order created successfully!",
     "data": {
       "orderId": 123,
       "orderNumber": "ORD-20240115-12345",
       "createdAt": "2024-01-15T10:30:00Z"
     }
   }
   Return Codes: SUCCESS, VALIDATION_ERROR, SERVER_ERROR

=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();

// Import the order controller
const orderController = require('../controllers/orderController');

// ===== ROUTE: CREATE NEW ORDER =====
// When someone POSTs to /api/orders, run the createOrder function
// POST is used because we're creating new data
router.post('/', orderController.createOrder);

// Export the router so server.js can use it
module.exports = router;

