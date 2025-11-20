# Nook Admin Portal

Admin portal for managing Nook Buffet orders built with Next.js.

## Getting Started

### Prerequisites
- Node.js installed
- nook-server running on port 3013

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - The `.env.local` file is already set up
   - For local development: `NEXT_PUBLIC_API_URL=http://localhost:3013`
   - For production: `NEXT_PUBLIC_API_URL=https://nook.noodev8.com`

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to [http://localhost:3002](http://localhost:3002)

## Features

- View all orders with complete details
- See customer information (business name, email, phone, address)
- View fulfillment details (delivery/collection, date, time)
- See all buffets in each order with:
  - Number of people
  - Price per person
  - Dietary information
  - Allergens
  - Special notes
  - Complete menu items organized by category

## Project Structure

```
nook-admin/
├── app/
│   ├── page.js          # Main admin page showing all orders
│   ├── page.css         # Styles for the admin page
│   ├── layout.js        # Root layout component
│   └── globals.css      # Global styles
├── .env.local           # Environment configuration
├── package.json         # Dependencies and scripts
└── next.config.mjs      # Next.js configuration
```

## Available Scripts

- `npm run dev` - Start development server on port 3002
- `npm run build` - Build for production
- `npm start` - Start production server on port 3002
- `npm run lint` - Run ESLint

## API Integration

The admin portal connects to the nook-server API:
- **GET /api/orders** - Fetches all orders with complete details

## Port Configuration

The admin portal runs on **port 3002** by default to avoid conflicts with:
- nook-web (port 3000)
- nook-frontend (port 5173)
- nook-server (port 3013)

