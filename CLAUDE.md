# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nook Buffet is a sandwich buffet catering platform with four packages:
- **nook-server**: Node.js/Express backend API (port 3013)
- **nook-web**: Next.js customer ordering portal (port 3000)
- **nook-admin**: Next.js admin dashboard (port 3002)
- **nook-frontend**: Vite + React alternative frontend (port 5173)

## Commands

### nook-server (backend)
```bash
cd nook-server
npm install
npm run dev      # Development with nodemon
npm start        # Production
```

### nook-web (customer portal)
```bash
cd nook-web
npm install
npm run dev      # Development on port 3000
npm run build    # Production build
npm run lint     # ESLint
```

### nook-admin (admin dashboard)
```bash
cd nook-admin
npm install
npm run dev      # Development on port 3002
npm run build    # Production build
npm run lint     # ESLint
```

### nook-frontend (Vite)
```bash
cd nook-frontend
npm install
npm run dev      # Development on port 5173
npm run build    # Production build
```

## Architecture

### Backend (nook-server)

**MVC Structure:**
- `routes/` → Express routers, parse requests, validate auth
- `controllers/` → Business logic, format responses
- `models/` → Database queries only, return raw data
- `middleware/auth.js` → JWT verification and role checking
- `utils/transaction.js` → Database transaction wrapper

**Database:** PostgreSQL with direct queries (no ORM). Use `withTransaction()` for atomic operations.

**Order Data Hierarchy:**
- `orders` table → customer info, fulfillment details
- `order_buffets` table → buffet configurations per order
- `order_items` table → menu items per buffet

### Frontend

Both nook-web and nook-admin use Next.js 16 with App Router, React 19, and Tailwind CSS 4. nook-frontend uses Vite + React Router.

**Authentication (admin):** JWT stored in localStorage as `admin_token`. User data as `admin_user`.

## API Rules (CRITICAL)

See `/nook-docs/API-RULES.md` for complete rules. Key points:

### Response Pattern
- **Always return HTTP 200** - never use 4xx/5xx for API errors
- Every response includes `return_code` field

```json
{
  "return_code": "SUCCESS",
  "data": {}
}
```

### Standard Return Codes
- `SUCCESS` - Operation completed
- `MISSING_FIELDS` - Required fields missing
- `INVALID_*` - Validation failed (e.g., `INVALID_EMAIL`)
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Auth required/failed
- `FORBIDDEN` - No permission
- `SERVER_ERROR` - Unexpected error

### Route File Headers
Every API route file must include structured documentation:

```javascript
/*
=======================================================================
API Route: route_name
=======================================================================
Method: POST
Purpose: Description of what the route does
=======================================================================
Request Payload:
{ "field": "value" }

Success Response:
{ "return_code": "SUCCESS", "data": {} }
=======================================================================
Return Codes:
"SUCCESS"
"MISSING_FIELDS"
"SERVER_ERROR"
=======================================================================
*/
```

### Frontend Error Handling
- API client functions should **never throw** for API errors
- Return structured objects: `{ success: boolean, data?: any, error?: string }`
- Only throw for network/connection failures
- Caller decides how to handle errors (toast, redirect, etc.)

## Database Patterns

```javascript
const { query } = require('../database');
const { withTransaction } = require('../utils/transaction');

// Simple query
const result = await query('SELECT * FROM orders WHERE id = $1', [orderId]);

// Transaction for multi-table operations
await withTransaction(async (client) => {
  await client.query('INSERT INTO orders...', [...]);
  await client.query('INSERT INTO order_buffets...', [...]);
});
```

## External Services

- **Mapbox**: Geocoding and delivery distance validation
- **Resend**: Email notifications
- **PostgreSQL**: Remote database server

## Code Style

- Use extensive comments explaining WHY, not just WHAT
- Configuration objects for static content (not hardcoded strings)
- Never hardcode passwords - use `.env` values
