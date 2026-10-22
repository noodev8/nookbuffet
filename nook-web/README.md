Nook Web

The customer-facing website for Nook Buffet. This is what customers use to browse the menu, build their order, and place it.


WHAT IT DOES

Lets customers build their own sandwich (bread, fillings, sauce...), pick a collection slot and check out. Sandwiches can be collected the same day; the opening hours, slot length and notice needed are set in the admin portal.

Buffets are ordered by phone for now. The buffet page shows each buffet's menu with a banner asking customers to call. The online buffet ordering code (pick a buffet, choose food, add upgrades) is commented out, marked "Online buffet ordering", so it is easy to put back.

Customer accounts are hidden for now - the links to them are commented out in components/Navigation.js, marked "Customer accounts". The account pages still exist but nothing links to them, and every order goes through as a guest.

No payment is taken online. Customers pay on collection. Every order goes through as unpaid.

Staff can also log in here at /login using their admin credentials to place phone orders or walk-ins (type the address in - nothing links to it while accounts are hidden).


TECH

  - Next.js (App Router)
  - React
  - Tailwind CSS / plain CSS


GETTING STARTED

  cd nook-web
  npm install

Create a .env.local file with your API URL:

  NEXT_PUBLIC_API_URL=http://localhost:3013

  npm run dev     - dev
  npm run build   - production build
  npm start       - production

Runs on port 3000 by default.


PAGES

  /                 - Home page
  /menu             - Full menu display
  /select-buffet    - Buffet menus, with a banner to call and order (online buffet ordering is paused)
  /order            - Build your buffet — choose items per category (not linked while buffets are phone only)
  /upgrade          - Add upgrade packages to your order (not linked while buffets are phone only)
  /sandwiches       - Build your own sandwich and add it to the basket
  /basket           - Review everything and pick a collection date (and a collection slot, for sandwiches)
  /checkout         - Confirm details and place the order (unpaid)
  /checkout/success - Order confirmed page
  /account          - Order history, reorder, and profile (accounts are hidden for now)
  /login            - Customer login (accounts are hidden for now)
  /register         - Create a customer account (accounts are hidden for now)
  /about            - About page
  /contact          - Contact form


NOTES

The server (nook-server) needs to be running for anything to work. Make sure NEXT_PUBLIC_API_URL points to it.

