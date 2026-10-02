Nook Web

The customer-facing website for Nook Buffet. This is what customers use to browse the menu, build their order, and place it.


WHAT IT DOES

Lets customers pick a buffet, choose their food, add upgrades, and check out. They can also build their own sandwich (bread, fillings, sauce...) on its own or alongside buffets. Sandwich-only orders can be collected the same day if placed before the sandwich cutoff (11:00 by default, set in the admin portal); the sandwich options only appear when staff have switched sandwiches on. They can create an account to view their order history and reorder.

No payment is taken online. Customers pay on collection. Every order goes through as unpaid, and staff mark it paid in the admin portal once the customer has paid.

Staff can also log in here using their admin credentials to place phone orders or walk-ins.


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
  /select-buffet    - Pick a buffet type
  /order            - Build your buffet — choose items per category
  /upgrade          - Add upgrade packages to your order
  /sandwiches       - Build your own sandwich and add it to the basket
  /basket           - Review everything and pick a collection date (and a 5-minute collection slot, for sandwiches)
  /checkout         - Confirm details and place the order (unpaid)
  /checkout/success - Order confirmed page
  /account          - Order history, reorder, and profile
  /login            - Customer login (also used by staff)
  /register         - Create a customer account
  /about            - About page
  /contact          - Contact form


NOTES

The server (nook-server) needs to be running for anything to work. Make sure NEXT_PUBLIC_API_URL points to it.

