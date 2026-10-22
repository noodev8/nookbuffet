Nook Admin

The internal portal for Nook Buffet staff. Not public facing — this is where the team manages orders, menus, and settings.


WHAT IT DOES

Gives staff a place to see incoming orders, update statuses, manage the menu and set prices. Different roles see different things depending on their access level.

Staff log in with just a username and password.


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
  /sandwich-slots - Time slots - how booked each collection time is on a day; tap a time to block it, like it filled up with orders
  /sandwich-menu  - Sandwich Menu - tap items sold out or back in stock (all staff); Change a section to edit its items and prices (admins only)
  /sandwich-settings - Sandwich Settings - base price, collection hours, time slot length, orders per slot, minimum notice, most sandwiches in one order (admins only)

  Buffets
  /buffet-orders  - Buffet Orders - open buffet orders grouped by collection day, overdue first
  /buffet-prep    - Buffet Prep - everything to make for buffets, added up per collection day
  /buffet-menu    - Buffet Menu - pick a buffet to change its price, categories, items and stock; Upgrades tab (admins only)

  /orders/[id]    - One order - mark ready (emails the customer), mark collected, print, cancel, note to customer
  /archive        - Collected and cancelled orders, newest first, with search; open one to restore it
  /staff          - Staff accounts (admins only)

The two Orders tabs show a red count of open orders, checked every minute.

Order flow: new order (pending) -> "Order ready" emails the customer and the order stays on the list
marked Ready -> "Collected" archives it. Cancelling also archives it. Archived orders are kept, not
deleted, and can be restored from their page.

Old addresses redirect: /summary to /buffet-prep, /menu (and /prices, /menu-builder) to /buffet-menu,
/sandwiches to /sandwich-menu.


ROLES

There are two roles. Permissions are enforced on the server - the frontend just hides things that aren't relevant.

  general  - Orders for sandwiches and buffets, and buffet prep
  admin    - Everything: orders, prep, both menus (stock, prices, upgrades) and staff accounts


NOTES

The server (nook-server) needs to be running. Staff log in with their admin credentials, not a customer account.

