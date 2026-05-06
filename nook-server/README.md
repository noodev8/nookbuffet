# Nook Server

The backend API for the Nook Buffet platform. Built with Node.js and Express, talks to a PostgreSQL database.

## What it does

Handles everything behind the scenes — orders, menus, customer accounts, payments, emails, and staff auth. Both the customer website and the admin portal talk to this.

## Tech

- Node.js / Express
- PostgreSQL (via `pg`)
- JWT for auth
- bcrypt for password hashing
- Stripe for payments
- Resend for emails
- Mapbox API for delivery distance checks
- Axios for external API calls (Mapbox, Ollama)
- Multer for file uploads (menu images)
- Ollama (Mistral) for AI-powered custom reports — needs to be running separately on the server

## Getting started

```bash
cd nook-server
npm install
```

Create a `.env` file:

```
DATABASE_URL=postgres://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_...
RESEND_API_KEY=re_...
MAPBOX_API_KEY=pk_...
```

```bash
# Dev (auto-restarts on changes)
npm run dev

# Production
npm start

# Tests
npm test
```

Runs on port 3013 by default.

## API routes

| Route | What it does |
|---|---|
| `/api/auth` | Staff login (password + 2FA code), verify 2FA, staff management |
| `/api/customers` | Customer register, login, profile update, order history |
| `/api/orders` | Create orders, get orders, update status, staff notes |
| `/api/menu` | Menu categories and items |
| `/api/buffet-versions` | Buffet types and pricing (Standard, Kids, etc.) — supports per-branch versions |
| `/api/upgrades` | Buffet upgrade options |
| `/api/branches` | Branch locations, delivery radius, slot config |
| `/api/delivery` | Delivery distance check via Mapbox |
| `/api/payments` | Stripe payment intent creation |
| `/api/reports` | Stock, branch, account, and AI custom reports |
| `/api/upload` | Image uploads for menu items and categories |
| `/api/contact` | Contact form submissions |

## Auth

Staff login is two steps. First call checks the password and sends a 6-digit code to the staff member's email. Second call verifies the code and returns a 24-hour session token. The code expires after 10 minutes and is cleared from the database once used.

All protected routes use the `verifyToken` middleware. Role-restricted routes also use `checkRole` — for example, reports are manager-only and the AI custom report endpoint won't run for anyone below manager level.

## Structure

```
server.js          - Entry point
routes/            - Route definitions
controllers/       - Request handling logic
models/            - Database queries
middleware/        - Auth and role checking
utils/             - Email, Mapbox distance calc, order date logic
config/            - AI schema context for Ollama prompts
tests/             - Jest unit tests
```

## Tests

Unit tests live in `tests/` and cover user management, menu items, categories, and buffet versions. Run them with:

```bash
npm test
```

Tests mock the model layer so no database connection is needed to run them.
