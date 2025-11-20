# Order System Setup

## Overview
This document explains the order creation system that saves customer orders to the database.

## Database Schema

The order system uses 3 main tables:

### 1. `orders` table
Main order information:
- `order_number` - Unique order identifier (format: ORD-YYYYMMDD-XXXXX)
- `customer_email` - Customer's email address
- `customer_phone` - Customer's phone number
- `fulfillment_type` - Either 'delivery' or 'collection'
- `fulfillment_address` - Delivery/collection address
- `fulfillment_date` - Date for delivery/collection
- `fulfillment_time` - Time for delivery/collection
- `total_price` - Total order price
- `status` - Order status (default: 'pending')
- `payment_status` - Payment status (default: 'pending')
- `payment_method` - Payment method used
- `notes` - Business name or other notes

### 2. `order_buffets` table
Each buffet within an order:
- `order_id` - Links to orders table
- `buffet_version_id` - Which buffet version was ordered
- `num_people` - Number of people for this buffet
- `price_per_person` - Price per person
- `subtotal` - Total for this buffet
- `dietary_info` - Dietary requirements
- `allergens` - Allergen information
- `notes` - Special requests

### 3. `order_items` table
Individual menu items selected for each buffet:
- `order_buffet_id` - Links to order_buffets table
- `menu_item_id` - Links to menu_items table
- `item_name` - Name of the item (stored for history)
- `category_name` - Category name (stored for history)
- `quantity` - Quantity ordered (default: 1)

## API Endpoint

### POST /api/orders
Creates a new order with all buffets and items.

**Request Body:**
```json
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
```

**Success Response:**
```json
{
  "return_code": "SUCCESS",
  "message": "Order created successfully!",
  "data": {
    "orderId": 123,
    "orderNumber": "ORD-20240115-12345",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Files Created

### Backend (nook-server):
1. `models/orderModel.js` - Database queries for orders
2. `controllers/orderController.js` - Business logic for order creation
3. `routes/orderRoutes.js` - API endpoint definition
4. `server.js` - Updated to register order routes

### Frontend (nook-web):
1. `app/checkout/page.js` - Updated to call the API

### Database:
1. `nook-docs/migrations/add_delivery_datetime_to_orders.sql` - Migration to add date/time fields

## Setup Instructions

1. **Run the database migration:**
   ```sql
   -- Connect to your database and run:
   \i nook-docs/migrations/add_delivery_datetime_to_orders.sql
   ```

2. **Restart the nook-server:**
   ```bash
   cd nook-server
   npm start
   ```

3. **Test the order flow:**
   - Go to the website
   - Select a buffet and add items
   - Add to basket
   - Fill in business details
   - Proceed to checkout
   - Fill in payment details (test mode)
   - Confirm order
   - Check the database to see the order was created

## How It Works

1. User completes order on checkout page
2. Frontend sends POST request to `/api/orders`
3. Order controller validates the data
4. Order model creates a database transaction:
   - Inserts main order record
   - For each buffet: inserts buffet record
   - For each item in buffet: inserts item record
5. If all succeed, transaction commits
6. If any fail, transaction rolls back (nothing saved)
7. Success response sent back with order number
8. Frontend shows confirmation and clears basket

## Transaction Safety

The order creation uses a database transaction, which means:
- Either ALL data is saved successfully
- OR nothing is saved at all
- This prevents partial orders in the database
- Keeps data consistent and reliable

