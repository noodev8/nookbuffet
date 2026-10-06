Nook Admin

The internal portal for Nook Buffet staff. Not public facing — this is where the team manages orders, menus, and settings.


WHAT IT DOES

Gives staff a place to see incoming orders, update statuses, manage the menu and set prices. Different roles see different things depending on their access level.

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

The navigation is split into two sections, Sandwiches and Buffets, each with its own
Orders and Menu pages (plus Prep for buffets).

  /login          - Staff login

  Sandwiches
  /               - Sandwich Orders - open sandwich orders by collection time, with what to make listed in each row
  /sandwich-menu  - Sandwich Menu - base price, on/off, same-day cutoff, collection hours, orders per 5-minute slot, steps (bread, fillings...) and their options (admins only)

  Buffets
  /buffet-orders  - Buffet Orders - open buffet orders grouped by collection day, overdue first
  /buffet-prep    - Buffet Prep - everything to make for buffets, added up per collection day
  /buffet-menu    - Buffet Menu - pick a buffet to change its price, categories, items and stock; Upgrades tab (admins only)

  /orders/[id]    - One order - mark paid, mark ready (emails the customer), print, cancel, note to customer
  /staff          - Staff accounts (admins only)

The two Orders tabs show a red count of open orders, checked every minute.

Old addresses redirect: /summary to /buffet-prep, /menu (and /prices, /menu-builder) to /buffet-menu,
/sandwiches to /sandwich-menu.


ROLES

There are two roles. Permissions are enforced on the server - the frontend just hides things that aren't relevant.

  general  - Orders for sandwiches and buffets, and buffet prep
  admin    - Everything: orders, prep, both menus (stock, prices, upgrades) and staff accounts


NOTES

The server (nook-server) needs to be running. Staff log in with their admin credentials, not a customer account.

