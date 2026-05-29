# Shopfront Ordering Platform

A multi-shop ordering platform for local restaurants and stores, built with Next.js 14 and Firebase/Neon.

## Tech Stack

- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Deployment:** Vercel / Firebase Hosting

## Features

- Multi-shop storefronts using `?shop=<slug>` routing
- Guided onboarding wizard at `/admin/setup`
- Shop-specific menu, orders, analytics, and inventory
- WhatsApp checkout handoff per shop
- Saved carts, order packs, and order history
- Admin dashboard, order flow, and stats by shop

## Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone and install dependencies:
```bash
git clone <your-repo-url>
cd <your-project-folder>
npm install
```

2. Set up environment variables:
```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your Firebase credentials
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Onboarding A New Shop

1. Go to `/admin/setup`
2. Fill in shop slug, name, contact channels, and category defaults
3. Save to generate:
	- Public storefront URL: `/home?shop=<slug>`
	- Shop-specific setup URL: `/admin/setup?shop=<slug>`
4. Load menu items under `/admin/menu?shop=<slug>`

For a full owner workflow (signup, product uploads, manual payments, tracking, and customization), see [SELLER-ONBOARDING.md](./SELLER-ONBOARDING.md).

## Project Structure

```
app/                  # Routes, APIs, admin, onboarding
components/           # UI and providers (includes ShopProvider)
lib/                  # Shared shop config, db helpers, auth
scripts/              # Schema migration and utility scripts
data/                 # Sample menu fallback data
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive production deployment instructions.

Quick deploy to Vercel:
```bash
vercel
```

## Admin Panel

Access admin features at `/admin`:
- `/admin/setup` for onboarding and branding setup
- `/admin/menu` for menu management
- `/admin/orders` for operations
- `/admin/stats` for analytics

Add `?shop=<slug>` to any admin route for a specific storefront.

## License

Proprietary © 2026
