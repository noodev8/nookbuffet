Nook Admin

The internal portal for Nook Buffet staff. Not public facing — this is where the team manages orders, menus, and settings.


WHAT IT DOES

Gives staff and managers a place to see incoming orders, update statuses, manage the menu, set prices, and pull reports. Different roles see different things depending on their access level.

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

  /login          - Staff login (2FA)
  /               - Dashboard / order overview
  /orders/[id]    - Individual order detail, status updates, and staff notes
  /menu           - Manage individual menu items and stock
  /menu-builder   - Build menus — categories, items, images, and display order
  /prices         - Manage buffet pricing per branch
  /reports        - Stock, branch, account, and AI custom reports
  /staff          - Add, edit, and deactivate staff accounts
  /branches       - Branch locations, delivery radius, and slot config
  /summary        - Production summary — what needs to be made for upcoming orders


ROLES

There are three roles. Permissions are enforced on the server — the frontend just hides things that aren't relevant.

  staff    - View orders, update statuses, manage stock
  admin    - Everything staff can do, plus edit menus and prices
  manager  - Everything admin can do, plus manage staff accounts and access reports


NOTES

The server (nook-server) needs to be running. Staff log in with their admin credentials, not a customer account.

The custom AI reports tab on the reports page requires Ollama to be running on the server. The other report tabs work without it.
