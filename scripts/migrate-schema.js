const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
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
}

migrate().catch(e => { console.error('Error:', e.message); process.exit(1); });
