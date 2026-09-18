Nook Server

The backend API for the Nook Buffet platform. Built with Node.js and Express, talks to a PostgreSQL database.


WHAT IT DOES

Handles everything behind the scenes — orders, menus, customer accounts, emails, and staff auth. Both the customer website and the admin portal talk to this.


TECH

  - Node.js / Express
  - PostgreSQL (via pg)
  - JWT for auth
  - bcrypt for password hashing
  - Resend for emails
  - Multer for file uploads (menu images)


GETTING STARTED

  cd nook-server
  npm install

Create a .env file:

  DATABASE_URL=postgres://...
  JWT_SECRET=...
  RESEND_API_KEY=re_...

  npm run dev     - dev (auto-restarts on changes)
  npm start       - production
  npm test        - run tests

Runs on port 3013 by default.


API ROUTES

  /api/auth             - Staff login (password + 2FA code), verify 2FA, staff management
  /api/customers        - Customer register, login, profile update, order history
  /api/orders           - Create orders, get orders, update status, staff notes, mark paid/unpaid
  /api/menu             - Menu categories and items
  /api/buffet-versions  - Buffet types and pricing (Standard, Kids, etc.)
  /api/upgrades         - Buffet upgrade options
  /api/upload           - Image uploads for menu items and categories
  /api/contact          - Contact form submissions


AUTH

Staff login is two steps. First call checks the password and sends a 6-digit code to the staff member's email. Second call verifies the code and returns a 24-hour session token. The code expires after 10 minutes and is cleared from the database once used.

All protected routes use the verifyToken middleware. Role-restricted routes also use checkRole.


STRUCTURE

  server.js       - Entry point
  routes/         - Route definitions
  controllers/    - Request handling logic
  models/         - Database queries
  middleware/     - Auth and role checking
  utils/          - Email and order date logic
  tests/          - Jest unit tests


TESTS

Unit tests live in tests/ and cover user management, menu items, categories, and buffet versions. Run with npm test.

Tests mock the model layer so no database connection is needed to run them.
