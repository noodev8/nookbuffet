# Nook Server

The backend API for the Nook Buffet platform. Built with Node.js and Express, talks to a PostgreSQL database.

## What it does

Handles everything behind the scenes — orders, menus, customer accounts, payments, emails, and staff auth. Both the customer website and the admin portal talk to this.

## Tech

- Node.js / Express
- PostgreSQL (via `pg`)
- JWT for auth
- Stripe for payments
- Resend for emails
- bcrypt for password hashing

## Getting started

```bash
cd nook-server
npm install
```

Create a `.env` file with your database connection, JWT secret, Stripe keys, and Resend API key.

```bash
# Dev (auto-restarts on changes)
npm run dev

# Production
npm start
```

Runs on port 3013 by default.

## API routes

| Route | What it does |
|---|---|
| `/api/auth` | Staff login |
| `/api/customers` | Customer register, login, profile, order history |
| `/api/orders` | Create and manage orders |
| `/api/menu` | Menu sections and items |
| `/api/buffet-versions` | Buffet types (Standard, Kids, etc.) |
| `/api/upgrades` | Buffet upgrade options |
| `/api/branches` | Location management |
| `/api/delivery` | Delivery zone config |
| `/api/reports` | Sales and stock reports |
| `/api/contact` | Contact form submissions |

## Structure

```
server.js          - Entry point
routes/            - Route definitions
controllers/       - Request handling logic
models/            - Database queries
middleware/        - Auth middleware
utils/             - Email, distance calc, order dates
```
