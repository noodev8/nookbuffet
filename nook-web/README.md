# Nook Web

The customer-facing website for Nook Buffet. This is what customers use to browse the menu, build their order, and pay.

## What it does

Lets customers pick a buffet, choose their food, add upgrades, and check out. They can also create an account to view their order history and reorder.

## Tech

- Next.js (App Router)
- React
- Stripe for payments
- Tailwind CSS

## Getting started

```bash
cd nook-web
npm install
```

Create a `.env.local` file with your API URL and Stripe key:

```
NEXT_PUBLIC_API_URL=http://localhost:3013
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

```bash
# Dev
npm run dev

# Production build
npm run build
npm start
```

Runs on port 3000 by default.

## Pages

| Page | What it does |
|---|---|
| `/` | Home page |
| `/menu` | Full menu display |
| `/select-buffet` | Pick a buffet type and location |
| `/order` | Build your buffet order |
| `/upgrade` | Add upgrades to your order |
| `/basket` | Review your order |
| `/checkout` | Pay and confirm |
| `/account` | Order history and profile |
| `/login` | Customer login |
| `/register` | Create an account |
| `/about` | About page |
| `/contact` | Contact form |


## Notes

The server (`nook-server`) needs to be running for anything to work. Make sure `NEXT_PUBLIC_API_URL` points to it.
