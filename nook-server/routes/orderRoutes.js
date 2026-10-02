/*
=======================================================================================================================================
ORDER ROUTES - API endpoints for order creation
=======================================================================================================================================

ENDPOINTS:

1. GET /api/orders
   Purpose: Get all orders with complete details (for admin portal)
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Got all orders!",
     "data": [
       {
         "id": 1,
         "order_number": "ORD-20240115-12345",
         "customer_email": "customer@example.com",
         "customer_phone": "+44 1234 567890",
         "fulfillment_type": "collection",
         "fulfillment_address": "123 Main St, City",
         "fulfillment_date": "2024-01-15",
         "fulfillment_time": "12:00",
         "total_price": 109.00,
         "status": "pending",
         "payment_status": "unpaid",
         "notes": "Acme Corp",
         "created_at": "2024-01-15T10:30:00Z",
         "buffets": [...]
       }
     ],
     "count": 1
   }
   Return Codes: SUCCESS, SERVER_ERROR

2. POST /api/orders
   Purpose: Create a new order with buffets and items
   Request Body:
   {
     "email": "customer@example.com",
     "phone": "+44 1234 567890",
     "businessName": "Acme Corp",
     "address": "123 Main St, City",
     "fulfillmentType": "collection",
     "fulfillmentDate": "2024-01-15",
     "fulfillmentTime": "12:00",
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
     ],
     "sandwiches": [
       { "quantity": 2, "optionIds": [3, 8, 12], "notes": "Cut in half" }
     ]
   }
   An order needs at least one buffet or one sandwich. buffets and sandwiches may each be left out.
   - address is only required when there are buffets
   - with sandwiches, fulfillmentTime ("HH:MM") is required and must be one of the 5-minute slots
     within sandwich collection hours that still has room (see GET /api/sandwiches/slots)
   - sandwiches are priced on the server from the current menu, and totalPrice is worked out
     on the server too (buffet totals + sandwich totals) - the totalPrice sent is ignored
   - sandwich-only orders can be collected the same day if placed before sandwich_cutoff_time;
     anything with a buffet follows the usual daily_cutoff_time rule
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
   Return Codes: SUCCESS, VALIDATION_ERROR, INVALID_DATE, SANDWICHES_UNAVAILABLE, SLOT_FULL, SERVER_ERROR

   Orders returned by GET also have "sandwiches": [{ id, quantity, unit_price, subtotal, notes,
   options: [{ sandwich_option_id, step_name, option_name, extra_price }] }]

3. GET /api/orders/earliest-date
   Purpose: Earliest collection dates (public)
   Success Response: { return_code, data: { earliestDate, cutoffTime, isAfterCutoff,
     sandwiches: { earliestDate, today, cutoffTime, isAfterCutoff } } }

=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();

// Import the order controller
const orderController = require('../controllers/orderController');

// Import auth middleware for protected routes
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ===== ROUTE: GET EARLIEST ORDER DATE =====
// When someone GETs /api/orders/earliest-date, run the getEarliestOrderDate function
// NOTE: This must come BEFORE any parameterized routes like /:id
router.get('/earliest-date', orderController.getEarliestOrderDate);

// ===== ROUTE: GET ALL ORDERS (PROTECTED) =====
// When someone GETs /api/orders, run the getAllOrders function
// GET is used because just reading data
// General and admin users can view orders
router.get('/', verifyToken, checkRole(['general', 'admin']), orderController.getAllOrders);

// ===== ROUTE: GET SINGLE ORDER BY ID (PROTECTED) =====
// When someone GETs /api/orders/:id, run the getOrderById function
// GET is used 
// General and admin users can view orders
router.get('/:id', verifyToken, checkRole(['general', 'admin']), orderController.getOrderById);

// ===== ROUTE: CREATE NEW ORDER =====
// When someone POSTs to /api/orders, run the createOrder function
// POST is used because we're creating new data
router.post('/', orderController.createOrder);

// ===== ROUTE: UPDATE ORDER STATUS (PROTECTED) =====
router.patch('/:id/status', verifyToken, checkRole(['general', 'admin']), orderController.updateOrderStatus);

// ===== ROUTE: UPDATE STAFF NOTES (PROTECTED) =====
router.patch('/:id/staff-notes', verifyToken, checkRole(['general', 'admin']), orderController.updateStaffNotes);

// ===== ROUTE: MARK ORDER PAID / UNPAID (PROTECTED) =====
// Body: { "payment_status": "paid" | "unpaid" }
router.patch('/:id/payment-status', verifyToken, checkRole(['general', 'admin']), orderController.updatePaymentStatus);

// Export the router so server.js can use it
module.exports = router;


