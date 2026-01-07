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
         "fulfillment_type": "delivery",
         "fulfillment_address": "123 Main St, City",
         "fulfillment_date": "2024-01-15",
         "fulfillment_time": "12:00",
         "total_price": 109.00,
         "status": "pending",
         "payment_status": "pending",
         "payment_method": "card",
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

// Import auth middleware for protected routes
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ===== ROUTE: GET EARLIEST ORDER DATE =====
// When someone GETs /api/orders/earliest-date, run the getEarliestOrderDate function
// NOTE: This must come BEFORE any parameterized routes like /:id
router.get('/earliest-date', orderController.getEarliestOrderDate);

// ===== ROUTE: GET ALL ORDERS (PROTECTED) =====
// When someone GETs /api/orders, run the getAllOrders function
// GET is used because just reading data
// All authenticated users (staff, admin, manager) can view orders
router.get('/', verifyToken, checkRole(['staff', 'admin', 'manager']), orderController.getAllOrders);

// ===== ROUTE: GET SINGLE ORDER BY ID (PROTECTED) =====
// When someone GETs /api/orders/:id, run the getOrderById function
// GET is used 
// All authenticated users (staff, admin, manager) can view orders
router.get('/:id', verifyToken, checkRole(['staff', 'admin', 'manager']), orderController.getOrderById);

// ===== ROUTE: CREATE NEW ORDER =====
// When someone POSTs to /api/orders, run the createOrder function
// POST is used because we're creating new data
router.post('/', orderController.createOrder);

// ===== ROUTE: UPDATE ORDER STATUS (PROTECTED) =====
// When someone PATCHes /api/orders/:id/status, run the updateOrderStatus function
// PATCH is used because its updating existing data
// All authenticated users (staff, admin, manager) can update order status
router.patch('/:id/status', verifyToken, checkRole(['staff', 'admin', 'manager']), orderController.updateOrderStatus);

// Export the router so server.js can use it
module.exports = router;


