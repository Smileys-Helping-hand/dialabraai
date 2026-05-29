# Seller Onboarding (No Online Payments Yet)

This guide is for a new store owner who wants to:
- sign up
- upload products and photos
- accept orders through the app
- track sales and products
- customize the look and feel of the store

## 1. Create the Owner Account

1. Open `/admin/login`
2. Click **New seller? Sign up**
3. Create the account with email and password
4. After signup, you will be redirected to `/admin/setup`

## 2. Create and Brand the Store

In `/admin/setup`:
1. Add shop slug and name
2. Add WhatsApp/contact details
3. Set colors and heading font
4. Upload logo and hero image
5. Save to generate the public store URL

Result:
- public storefront at `/home?shop=<slug>`
- admin control routes using `?shop=<slug>`

## 3. Upload Products and Pictures

In `/admin/menu?shop=<slug>`:
1. Add product name, description, price, and category
2. Upload an image file or paste an image URL
3. Save each item
4. Use bulk import if many products are ready in text format

## 4. Sell Through the App (Manual Payment)

The app is already set up for no online payment gateway:
- customers place orders in-app
- owner confirms and fulfills orders
- payment can be collected manually (cash/EFT on collection or delivery)
- owner can mark orders as paid from admin orders

Use these routes:
- `/menu?shop=<slug>` for customer browsing
- `/order?shop=<slug>` for checkout
- `/admin/orders?shop=<slug>` to manage fulfillment and payment status

## 5. Track Sales and Manage Operations

### Sales tracking
Use `/admin/stats?shop=<slug>` to monitor:
- today revenue and order counts
- week and month totals
- best-selling products
- category performance

### Product and stock tracking
Use `/admin/dashboard?shop=<slug>` to monitor:
- low stock alerts
- inventory levels
- sold quantities
- quick links to menu, orders, setup, and stats

## 6. Recommended Daily Workflow

1. Check `/admin/dashboard?shop=<slug>` for alerts
2. Process new orders in `/admin/orders?shop=<slug>`
3. Mark status: pending -> preparing -> ready -> completed
4. Mark paid orders when payment is received
5. Update products/stock in `/admin/menu?shop=<slug>`
6. Review performance in `/admin/stats?shop=<slug>`

## 7. Add Yoco Later

When ready for online payments, integrate Yoco in a later phase.
Until then, keep order terms set to manual payment (pay on collection/delivery).

