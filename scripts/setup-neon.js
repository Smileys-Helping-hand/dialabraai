const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  console.log('Connecting to Neon...');

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      items JSONB NOT NULL DEFAULT '[]',
      total_price NUMERIC NOT NULL DEFAULT 0,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      paid BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      user_id TEXT
    )
  `;
  console.log('✅ orders table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price NUMERIC NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT DEFAULT '',
      available BOOLEAN DEFAULT TRUE,
      stock INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    )
  `;
  console.log('✅ menu_items table ready');

  const tables = await sql`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
  console.log('Tables in DB:', tables.map(t => t.tablename).join(', '));
}

setup().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
