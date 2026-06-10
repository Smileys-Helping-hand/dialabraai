/**
 * Database Initialization Script
 * Run this once to set up all required tables in your Neon/PostgreSQL database
 * Usage: node scripts/init-db.js
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const schema = `
-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY DEFAULT 'shop_' || gen_random_uuid()::text,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  support_phone_display TEXT DEFAULT '',
  support_phone_dial TEXT DEFAULT '',
  support_email TEXT DEFAULT '',
  instagram_handle TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  location_summary TEXT DEFAULT '',
  service_areas TEXT DEFAULT '',
  order_terms TEXT DEFAULT '',
  estimated_ready_time TEXT DEFAULT '30-45 minutes',
  currency_symbol TEXT DEFAULT 'R',
  primary_color TEXT DEFAULT '#065F46',
  accent_color TEXT DEFAULT '#10B981',
  gold_color TEXT DEFAULT '#34D399',
  cream_color TEXT DEFAULT '#F3F4F6',
  charcoal_color TEXT DEFAULT '#111827',
  logo_url TEXT DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  default_menu_categories JSONB DEFAULT '[]',
  font_choice TEXT DEFAULT 'jakarta',
  is_open BOOLEAN DEFAULT TRUE,
  operating_hours TEXT DEFAULT '',
  payment_methods TEXT DEFAULT '',
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  utm_content TEXT DEFAULT '',
  campaign_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  shop_slug TEXT REFERENCES shops(slug) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total_price NUMERIC NOT NULL DEFAULT 0,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  paid BOOLEAN DEFAULT FALSE,
  user_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  shop_slug TEXT REFERENCES shops(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  available BOOLEAN DEFAULT TRUE,
  stock INTEGER,
  is_special BOOLEAN DEFAULT FALSE,
  dietary_tags TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registered apps table (for webhook support)
CREATE TABLE IF NOT EXISTS registered_apps (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE REFERENCES shops(slug) ON DELETE CASCADE,
  webhook_url TEXT DEFAULT '',
  api_key TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_shop_slug ON orders(shop_slug);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_menu_items_shop_slug ON menu_items(shop_slug);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
`;

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    console.log('📍 Database URL:', DATABASE_URL.replace(/:[^:]*@/, ':***@'));

    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        console.log('⏳ Executing:', statement.substring(0, 50) + '...');
        await sql(statement);
        console.log('✅ Success');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  Already exists (skipping)');
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Navigate to: http://localhost:3000/join');
    console.log('3. Create your first shop and start ordering!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
