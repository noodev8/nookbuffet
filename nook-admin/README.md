# Nook Admin

The internal portal for Nook Buffet staff. Not public facing — this is where the team manages orders, menus, and settings.

## What it does

Gives staff and managers a place to see incoming orders, update statuses, manage the menu, set prices, and pull reports. Different roles see different things depending on their access level.

## Tech

- Next.js (App Router)
- React
- Tailwind CSS

## Getting started

```bash
cd nook-admin
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3013
```

```bash
# Dev
npm run dev

# Production build
npm run build
npm start
```

Runs on port 3002 by default.

## Pages

| Page | What it does |
|---|---|
| `/` | Dashboard / order overview |
| `/orders` | View and manage all orders |
| `/orders/[id]` | Individual order detail and status |
| `/menu-builder` | Manage categories and menu items |
| `/prices` | Manage buffet pricing |
| `/reports` | Sales and stock reports |
| `/staff` | Staff account management |
| `/branches` | Location management |
| `/summary` | Order summary view |

## Roles

Access is controlled by role. Staff, managers, and admins each have different permissions set on the server side.

## Notes

The server (`nook-server`) needs to be running. Staff log in with their admin credentials, not a customer account.
