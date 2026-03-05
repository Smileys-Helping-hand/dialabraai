import { neon } from '@neondatabase/serverless';

let sql = null;

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL);
} else {
  console.warn('⚠️  DATABASE_URL not set. Database features will be unavailable.');
}

export { sql };

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getTimestamp() {
  return new Date().toISOString();
}

/**
 * SQL schema — run this once in your Neon SQL editor to create tables:
 *
 * CREATE TABLE IF NOT EXISTS orders (
 *   id TEXT PRIMARY KEY,
 *   items JSONB NOT NULL DEFAULT '[]',
 *   total_price NUMERIC NOT NULL DEFAULT 0,
 *   customer_name TEXT NOT NULL,
 *   customer_phone TEXT NOT NULL,
 *   customer_email TEXT DEFAULT '',
 *   notes TEXT DEFAULT '',
 *   status TEXT DEFAULT 'pending',
 *   paid BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   user_id TEXT
 * );
 *
 * CREATE TABLE IF NOT EXISTS menu_items (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   description TEXT DEFAULT '',
 *   price NUMERIC NOT NULL,
 *   category TEXT NOT NULL,
 *   image_url TEXT DEFAULT '',
 *   available BOOLEAN DEFAULT TRUE,
 *   stock INTEGER,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ
 * );
 */
