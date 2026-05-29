const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS shops (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT DEFAULT 'SF',
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
      primary_color TEXT DEFAULT '#762C1B',
      accent_color TEXT DEFAULT '#E46A28',
      gold_color TEXT DEFAULT '#F4C056',
      cream_color TEXT DEFAULT '#FFF4E2',
      charcoal_color TEXT DEFAULT '#1A1715',
      logo_url TEXT DEFAULT '',
      hero_image_url TEXT DEFAULT '',
      default_menu_categories JSONB DEFAULT '["Featured","Meals","Drinks","Desserts","Bundles"]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    )
  `;
  console.log('✅ shops table ready');

  await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#762C1B'`;
  await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#E46A28'`;
  await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS gold_color TEXT DEFAULT '#F4C056'`;
  await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS cream_color TEXT DEFAULT '#FFF4E2'`;
  await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS charcoal_color TEXT DEFAULT '#1A1715'`;
  await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT ''`;
  await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS hero_image_url TEXT DEFAULT ''`;
  console.log('✅ theme columns ready');

  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS shop_slug TEXT DEFAULT 'default'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_slug TEXT DEFAULT 'default'`;
  console.log('✅ shop_slug column added to menu_items and orders');

  await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_shop_slug ON menu_items (shop_slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_shop_slug ON orders (shop_slug)`;
  console.log('✅ shop_slug indexes ready');

  // Add low_stock_threshold if missing
  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5`;
  console.log('✅ low_stock_threshold column ready');

  // Set sensible thresholds on existing items
  await sql`UPDATE menu_items SET low_stock_threshold = 5 WHERE low_stock_threshold IS NULL`;
  console.log('✅ Default thresholds applied');

  // Verify
  const cols = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'menu_items'
    ORDER BY ordinal_position
  `;
  console.log('\nmenu_items columns:');
  cols.forEach(c => console.log(' ', c.column_name, '-', c.data_type));

  const orderCols = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'orders'
    ORDER BY ordinal_position
  `;
  console.log('\norders columns:');
  orderCols.forEach(c => console.log(' ', c.column_name, '-', c.data_type));
}

migrate().catch(e => { console.error('Error:', e.message); process.exit(1); });
