# Account & Order Packs Feature

## Overview
This feature adds optional user accounts with the following capabilities:
- Save order history when logged in
- Create and manage "Order Packs" (saved cart templates) for quick reordering
- Guest checkout still available (no account required)
- Automatic customer info saving for returning customers

## Features Added

### 1. **User Authentication**
- Optional sign-in/sign-up system using Firebase Auth
- Account button in navbar
- Guest mode always available
- Auto-fill customer info from account

### 2. **Menu Packs/Combos**
- Special combo meals (e.g., "Platter for 1", "Family Braai Pack")
- Pack items show included items and savings
- One-click add entire pack to cart
- Admin can create packs via menu management

### 3. **Order Packs (Saved Carts)**
- Save current cart as a named "Order Pack"
- Manage multiple order packs
- One-click load pack to cart
- Works for both logged-in users (cloud) and guests (localStorage)

### 4. **Order History**
- View all past orders (logged-in users only)
- Reorder with one click
- Track order status
- View order details

## New Components

### Account Management
- `components/AuthModal.jsx` - Sign in/Sign up modal
- `components/AccountButton.jsx` - Account dropdown in navbar
- `components/SaveCartModal.jsx` - Save cart as order pack

### Menu Packs
- `components/PackItemCard.jsx` - Display combo packs

### Pages
- `app/account/orders/page.js` - Order history page
- `app/account/packs/page.js` - Manage saved order packs

### Libraries
- `lib/auth.js` - Authentication context and helpers
- `lib/order-packs.js` - Order pack management utilities

## How to Use

### For Customers

**Without Account (Guest):**
1. Browse menu and add items
2. Optionally save cart as "Order Pack" (stored locally)
3. Place order without creating account
4. View saved packs at `/account/packs`

**With Account:**
1. Click "Sign In" in navbar
2. Create account or sign in
3. Browse menu and add items
4. Save cart as "Order Pack" (synced to cloud)
5. View order history at `/account/orders`
6. Reorder from history or saved packs

### For Admins

**Creating Menu Packs:**
1. Go to admin menu management
2. Create new menu item
3. Set `isPack: true`
4. Add `items` array with included items:
```javascript
{
  name: "Family Braai Pack",
  category: "Packs",
  price: 299.99,
  isPack: true,
  items: [
    { id: "chops", name: "Lamb Chops", quantity: 10, price: 15.00 },
    { id: "chicken", name: "Chicken Pieces", quantity: 8, price: 12.00 },
    // ... more items
  ]
}
```

**Add Sample Packs:**
```bash
node scripts/add-sample-packs.js
```

## Database Structure

### Menu Items (with packs)
```javascript
{
  name: string,
  description: string,
  category: string,
  price: number,
  available: boolean,
  isPack: boolean,  // NEW: true for combo packs
  items: [          // NEW: included items (for packs only)
    {
      id: string,
      name: string,
      quantity: number,
      price: number
    }
  ]
}
```

### Orders (updated)
```javascript
{
  items: array,
  customer_name: string,
  customer_phone: string,
  customer_email: string,
  notes: string,
  total_price: number,
  status: string,
  paid: boolean,
  created_at: timestamp,
  userId: string  // NEW: Link to user account (null for guests)
}
```

### User Order Packs
Collection: `users/{userId}/orderPacks`
```javascript
{
  name: string,
  items: array,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### User Profiles
Collection: `users/{userId}`
```javascript
{
  email: string,
  name: string,
  phone: string,
  createdAt: timestamp
}
```

## Key Features

✅ **Optional** - Customers can order without account
✅ **Persistent** - Saves order packs and history
✅ **Quick Reorder** - One-click reordering from packs/history
✅ **Combo Packs** - Special menu items with multiple items
✅ **Auto-fill** - Customer info auto-filled for logged-in users
✅ **Cloud Sync** - Order packs sync across devices when logged in
✅ **Guest Mode** - Local storage fallback for guests

## Navigation

- `/account/orders` - Order history (requires login)
- `/account/packs` - Manage order packs (works for guests too)
- Navbar - Account button with dropdown menu

## Testing

1. **Guest Flow:**
   - Add items to cart
   - Save as order pack
   - Place order without account
   - Return later and load saved pack

2. **Account Flow:**
   - Create account
   - Add items and save pack
   - Place order (linked to account)
   - View order history
   - Reorder from history

3. **Menu Packs:**
   - View combo packs on menu page
   - Add pack to cart (adds all items)
   - See savings vs individual items
