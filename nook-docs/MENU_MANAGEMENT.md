# Menu Management Feature

## Overview

The menu management feature allows admin and manager users to mark menu items as in stock or out of stock from the admin portal.

## Access Control

- **Admin**: Full access to menu management
- **Manager**: Full access to menu management
- **Staff**: No access (will be redirected if they try to access)

## Backend Implementation

### API Endpoints

#### 1. GET /api/menu/manage
- **Purpose**: Fetch all menu items for management
- **Authentication**: Required (JWT token)
- **Authorization**: Admin or Manager only
- **Response**:
```json
{
  "return_code": "SUCCESS",
  "data": [
    {
      "id": 1,
      "name": "Chicken Sandwich",
      "description": "Fresh chicken sandwich",
      "is_active": true,
      "category_id": 1,
      "category_name": "Sandwiches",
      "allergens": "Gluten, Dairy",
      "dietary_info": "Contains meat"
    }
  ],
  "count": 50
}
```

#### 2. PATCH /api/menu/manage/:id
- **Purpose**: Update stock status of a menu item
- **Authentication**: Required (JWT token)
- **Authorization**: Admin or Manager only
- **Request Body**:
```json
{
  "is_active": false
}
```
- **Response**:
```json
{
  "return_code": "SUCCESS",
  "message": "Menu item marked as out of stock",
  "data": {
    "id": 1,
    "name": "Chicken Sandwich",
    "is_active": false
  }
}
```

### Files Created/Modified

**Backend:**
- `nook-server/models/menuModel.js` - Added `getAllMenuItemsForManagement()` and `updateMenuItemStockStatus()`
- `nook-server/controllers/menuController.js` - Added management controller functions
- `nook-server/routes/menuRoutes.js` - Added protected management routes
- `nook-server/middleware/authMiddleware.js` - Created JWT verification and role checking middleware

**Frontend:**
- `nook-admin/app/menu/page.js` - Menu management page component
- `nook-admin/app/menu/menu.css` - Menu management page styles
- `nook-admin/app/page.js` - Added "Manage Menu" button (visible to admin/manager only)
- `nook-admin/app/page.css` - Added styles for menu button

## Frontend Usage

### Accessing Menu Management

1. Log in to the admin portal as admin or manager
2. Click the "Manage Menu" button in the header
3. You'll see a grid of all menu items organized by category

### Managing Stock Status

1. Each menu item card shows:
   - Item name
   - Category badge
   - Description
   - Dietary info
   - Allergens
   - Stock status button

2. Click the stock status button to toggle:
   - **Green "✓ In Stock"** - Item is available
   - **Red "✗ Out of Stock"** - Item is unavailable

3. Changes are saved immediately to the database

### Filtering

Use the category dropdown to filter items by category (Sandwiches, Wraps, Savoury, etc.)

## Authentication Flow

1. User logs in and receives JWT token
2. Token is stored in localStorage
3. When accessing menu management:
   - Frontend checks user role (must be admin or manager)
   - Frontend sends token in Authorization header: `Bearer <token>`
   - Backend verifies token with `verifyToken` middleware
   - Backend checks role with `checkRole(['admin', 'manager'])` middleware
   - If authorized, request proceeds to controller

## Database

The feature uses the existing `menu_items` table and the `is_active` field:
- `is_active = true` → Item is in stock
- `is_active = false` → Item is out of stock

No database schema changes were required.

## Security

- All menu management endpoints are protected with JWT authentication
- Role-based access control ensures only admin and manager can access
- Staff users are redirected if they try to access the menu management page
- JWT tokens expire after 24 hours
- Tokens are verified on every request

## Testing

1. **As Admin/Manager:**
   - Log in to admin portal
   - Click "Manage Menu"
   - Toggle stock status on items
   - Verify changes persist after page refresh

2. **As Staff:**
   - Log in to admin portal
   - Verify "Manage Menu" button is not visible
   - Try to access `/menu` directly - should redirect to home

3. **Without Authentication:**
   - Try to access `/menu` - should redirect to login
   - Try API endpoints without token - should return UNAUTHORIZED

