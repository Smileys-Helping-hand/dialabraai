const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);
const SHOP_SLUG = process.env.SEED_SHOP_SLUG || 'default';

const menuItems = [
  { name: 'Classic Burger', category: 'Meals', description: 'Beef patty with lettuce, tomato, and sauce.', price: 95.00, image_url: '', stock: 50, low_stock_threshold: 10 },
  { name: 'Chicken Wrap', category: 'Meals', description: 'Grilled chicken wrap with fresh salad.', price: 85.00, image_url: '', stock: 45, low_stock_threshold: 10 },
  { name: 'Loaded Fries', category: 'Sides', description: 'Crispy fries with cheese and sauce.', price: 55.00, image_url: '', stock: 70, low_stock_threshold: 15 },
  { name: 'Chocolate Shake', category: 'Drinks', description: 'Creamy chocolate milkshake.', price: 45.00, image_url: '', stock: 80, low_stock_threshold: 20 },
  { name: 'Vanilla Cupcake', category: 'Desserts', description: 'Freshly baked vanilla cupcake.', price: 25.00, image_url: '', stock: 90, low_stock_threshold: 20 },
  { name: 'Family Combo Box', category: 'Bundles', description: 'Meal bundle for 4 people.', price: 320.00, image_url: '', stock: 20, low_stock_threshold: 5 },
];

async function seed() {
  console.log(`Seeding menu_items for shop: ${SHOP_SLUG}...`);

  // Clear existing items for this shop only
  await sql`DELETE FROM menu_items WHERE COALESCE(shop_slug, 'default') = ${SHOP_SLUG}`;
  console.log('Cleared existing menu items for selected shop.');

  for (const item of menuItems) {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await sql`
      INSERT INTO menu_items (id, name, description, price, category, image_url, available, stock, low_stock_threshold, created_at, shop_slug)
      VALUES (${id}, ${item.name}, ${item.description}, ${item.price}, ${item.category}, ${item.image_url}, true, ${item.stock}, ${item.low_stock_threshold}, NOW(), ${SHOP_SLUG})
    `;
    console.log(`  ✅ ${item.category}: ${item.name} (R${item.price})`);
  }

  const count = await sql`SELECT COUNT(*) FROM menu_items WHERE COALESCE(shop_slug, 'default') = ${SHOP_SLUG}`;
  console.log(`\nMenu seeded for ${SHOP_SLUG}: ${count[0].count} items in Neon DB.`);
}

seed().catch(e => {
  console.error('Seed error:', e.message);
  process.exit(1);
});
