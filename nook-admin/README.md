Nook Admin

The internal portal for Nook Buffet staff. Not public facing — this is where the team manages orders, menus, and settings.


WHAT IT DOES

Gives staff and managers a place to see incoming orders, update statuses, manage the menu and set prices. Different roles see different things depending on their access level.

Login uses 2-factor authentication — password first, then a 6-digit code sent to the staff member's email.


TECH

  - Next.js (App Router)
  - React
  - @dnd-kit for drag and drop (menu ordering)
  - Tailwind CSS / plain CSS


GETTING STARTED

  cd nook-admin
  npm install

Create a .env.local file:

  NEXT_PUBLIC_API_URL=http://localhost:3013

  npm run dev     - dev
  npm run build   - production build
  npm start       - production

Runs on port 3002 by default.


PAGES

Every page shares one header (app/components/AdminShell.js) with the navigation, the
logged-in user and Log out. It also checks the login and provides an api() helper.

  /login          - Staff login (2FA)
  /               - Orders - open orders grouped by collection day, overdue first
  /orders/[id]    - One order - mark paid, mark ready (emails the customer), print, cancel, note to customer
  /summary        - Prep Summary - everything to make, added up per collection day
  /menu           - Menu - pick a buffet to change its price, categories, items and stock; Upgrades tab
  /staff          - Staff accounts (managers only)

/prices and /menu-builder redirect to /menu.


ROLES

There are three roles. Permissions are enforced on the server - the frontend just hides things that aren't relevant.

  staff    - Orders, prep summary, and marking menu items in or out of stock
  admin    - Everything staff can do, plus editing the menu, prices and upgrades
  manager  - Everything admin can do, plus managing staff accounts


NOTES

The server (nook-server) needs to be running. Staff log in with their admin credentials, not a customer account.

