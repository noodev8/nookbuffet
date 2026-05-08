Nook Web

The customer-facing website for Nook Buffet. This is what customers use to browse the menu, build their order, and pay.


WHAT IT DOES

Lets customers pick a buffet, choose their food, add upgrades, and check out. They can create an account to view their order history and reorder.

Staff can also log in here using their admin credentials. When the site detects a staff account it skips the payment screen entirely for phone orders or walk-ins where no card is needed.


TECH

  - Next.js (App Router)
  - React
  - Stripe for payments
  - Tailwind CSS / plain CSS


GETTING STARTED

  cd nook-web
  npm install

Create a .env.local file with your API URL and Stripe key:

  NEXT_PUBLIC_API_URL=http://localhost:3013
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

  npm run dev     - dev
  npm run build   - production build
  npm start       - production

Runs on port 3000 by default.


PAGES

  /                 - Home page
  /menu             - Full menu display
  /select-buffet    - Pick a buffet type and branch
  /order            - Build your buffet — choose items per category
  /upgrade          - Add upgrade packages to your order
  /basket           - Review everything before paying
  /checkout         - Stripe payment and order confirmation
  /checkout/success - Order confirmed page
  /account          - Order history, reorder, and profile
  /login            - Customer login (also used by staff)
  /register         - Create a customer account
  /staff            - Staff order entry (skips payment)
  /about            - About page
  /contact          - Contact form


NOTES

The server (nook-server) needs to be running for anything to work. Make sure NEXT_PUBLIC_API_URL points to it.

Ollama is not required for this frontend — that's only used by the admin reports.
