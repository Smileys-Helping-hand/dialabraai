# 🗄️ Database Setup Guide

## Overview

This guide will help you set up the Dialabraai database to support the multi-tenant food/retail ordering platform.

## ✅ Prerequisites

- [Neon PostgreSQL](https://neon.tech) account (free tier available)
- `DATABASE_URL` environment variable configured in `.env.local`
- Node.js 18+ installed

## 🚀 Quick Setup

### Step 1: Get Your Database URL

1. Create a Neon project at https://neon.tech
2. Copy your PostgreSQL connection string (looks like: `postgresql://user:password@...`)
3. Add it to your `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@yourhost.neon.tech/yourdb?sslmode=require
```

### Step 2: Initialize Database Tables

Run the initialization script:

```bash
npm run init-db
```

This will:
- ✅ Create `shops` table (store profiles)
- ✅ Create `orders` table (bookings/purchases)
- ✅ Create `menu_items` table (products/services)
- ✅ Create `registered_apps` table (webhook configuration)
- ✅ Add proper indexes for performance
- ✅ Skip any tables that already exist

### Step 3: Start the App

```bash
npm run dev
```

Open http://localhost:3000 and start onboarding stores!

## 📋 Database Schema

### `shops` Table
Stores business profiles:
- Basic info: name, slug, tagline, description
- Contact: phone, email, WhatsApp, Instagram
- Configuration: hours, payment methods, currency
- Branding: colors, fonts, logo, hero image
- Categories: what the business offers (multi-category support)
- Status: active/inactive, open/closed

### `orders` Table
Tracks customer orders/bookings:
- Items ordered (JSONB array)
- Customer info: name, phone, email
- Payment status
- Order status: pending → preparing → ready → completed
- Timestamps

### `menu_items` Table
Product/service catalog:
- Name, description, price
- Category, availability, stock
- Image URL
- Dietary tags, special status
- Shop reference for multi-tenancy

### `registered_apps` Table
Webhook configuration for third-party integrations:
- Shop reference
- Webhook URL
- API key for authentication

## 🔧 Management

### View Database

Use Neon's web console:
1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor"
4. Run queries directly

### Common Queries

**List all shops:**
```sql
SELECT slug, name, is_open, created_at FROM shops ORDER BY created_at DESC;
```

**View recent orders:**
```sql
SELECT id, shop_slug, customer_name, status, total_price, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 20;
```

**Check menu items for a shop:**
```sql
SELECT name, category, price, available 
FROM menu_items 
WHERE shop_slug = 'your-shop-slug'
ORDER BY category;
```

## 🆘 Troubleshooting

### "relation 'shops' does not exist"
- Database tables haven't been created
- Run: `npm run init-db`
- Check your DATABASE_URL is correct

### "Connection refused"
- DATABASE_URL is invalid or database is down
- Verify connection string in Neon console
- Check network/firewall isn't blocking

### "Permission denied"
- Database user doesn't have proper permissions
- Re-create connection string from Neon console
- Make sure user has CREATE TABLE permissions

### Very slow queries
- Indexes haven't been created
- Run init script again: `npm run init-db`
- Check if database has enough resources

## 📈 Scaling Considerations

### For Production:

1. **Backups**: Enable automatic backups in Neon settings
2. **Read Replicas**: Add read replicas for reporting/analytics
3. **Connection Pooling**: Use PgBouncer for high-traffic loads
4. **Monitoring**: Set up Neon alerts for database health
5. **Performance**: Add indexes on frequently-filtered columns

### Monitoring Queries:

```sql
-- Slow queries
SELECT query, mean_exec_time FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC;

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
```

## 🎯 Next Steps

1. ✅ Initialize database: `npm run init-db`
2. ✅ Start dev server: `npm run dev`
3. ✅ Visit http://localhost:3000/join to create first shop
4. ✅ Visit http://localhost:3000/admin/menu to add products/services
5. ✅ Share shop link for customers to order

## 📚 API Reference

All database operations are handled by these routes:

- `POST /api/shops/bootstrap` - Create/update shop profile
- `POST /api/orders/create` - Create new order
- `GET /api/orders/list` - List orders for a shop
- `POST /api/orders/update-status` - Update order status
- `GET /api/admin/stats` - Get shop statistics
- `GET /api/admin/inventory` - Get inventory status

See individual route files in `app/api/` for details.

## ❓ Need Help?

- Check `.env.local` for proper DATABASE_URL
- Review Neon documentation: https://neon.tech/docs
- Check console errors for specific error messages
- Verify your database has connectivity

Happy ordering! 🎉
