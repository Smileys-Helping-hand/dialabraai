# Dial-A-Braai

A modern food ordering web application for Dial-A-Braai, built with Next.js 14 and Firebase.

## Tech Stack

- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Deployment:** Vercel / Firebase Hosting

## Features

- 🍖 Browse menu by category (Seafood, Meat, Chicken, Sides, Combos)
- 🛒 Shopping cart with local storage persistence
- 📱 Fully responsive design
- 🔥 Real-time order management for admins
- 📊 Admin dashboard with statistics
- 🔐 Secure admin authentication

## Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone and install dependencies:
```bash
git clone https://github.com/Smileys-Helping-hand/dialabraai.git
cd dialabraai
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

## Project Structure

```
dialabraai/
├── api/              # Next.js API routes (Firestore operations)
├── app/              # Next.js app directory (pages & layouts)
├── components/       # React components
├── lib/              # Utilities & Firebase config
├── public/           # Static assets (images, icons)
├── data/             # Sample menu data (fallback)
└── DEPLOYMENT.md     # Full production deployment guide
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive production deployment instructions.

Quick deploy to Vercel:
```bash
vercel
```

## Admin Panel

Access admin features at `/admin/login`:
- View and manage orders
- Update order status (pending → preparing → ready → completed)
- Mark orders as paid
- Manage menu items
- View sales statistics

## License

Proprietary - Dial-A-Braai © 2025
