const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const menuItems = [
  // Seafood
  { name: 'Grilled Snoek', category: 'Seafood', description: 'Local snoek grilled to perfection with lemon butter.', price: 120.00, image_url: '/images/menu/snoek.svg', stock: 50, low_stock_threshold: 10 },
  { name: 'Calamari', category: 'Seafood', description: 'Crispy fried calamari with chilli dip.', price: 95.00, image_url: '', stock: 30, low_stock_threshold: 8 },
  { name: 'Linefish (Whole)', category: 'Seafood', description: "Fresh whole linefish braai'd over open coals.", price: 160.00, image_url: '', stock: 20, low_stock_threshold: 5 },
  // Meat
  { name: 'Beef Braai Pack', category: 'Meat', description: 'Charred beef with signature spice rub.', price: 150.00, image_url: '/images/menu/beef.svg', stock: 30, low_stock_threshold: 5 },
  { name: 'Boerewors Roll', category: 'Meat', description: 'Traditional SA boerewors in a fresh roll.', price: 65.00, image_url: '', stock: 60, low_stock_threshold: 10 },
  { name: 'Lamb Chops (2)', category: 'Meat', description: "Two karoo lamb chops, braai'd over wood coals.", price: 185.00, image_url: '', stock: 25, low_stock_threshold: 5 },
  { name: 'Pork Ribs (Half Rack)', category: 'Meat', description: 'Slow-cooked pork ribs with sticky BBQ glaze.', price: 175.00, image_url: '', stock: 20, low_stock_threshold: 5 },
  // Chicken
  { name: 'Chicken Quarter', category: 'Chicken', description: 'Marinated chicken quarter with house sauce.', price: 90.00, image_url: '/images/menu/chicken.svg', stock: 40, low_stock_threshold: 10 },
  { name: 'Chicken Half', category: 'Chicken', description: 'Half chicken with peri-peri marinade.', price: 140.00, image_url: '', stock: 30, low_stock_threshold: 8 },
  { name: 'Chicken Livers', category: 'Chicken', description: 'Spiced chicken livers in creamy sauce. Served with bread.', price: 75.00, image_url: '', stock: 25, low_stock_threshold: 5 },
  // Sides
  { name: 'Pap & Vleis', category: 'Sides', description: 'Traditional maize pap with braai gravy.', price: 45.00, image_url: '', stock: 80, low_stock_threshold: 15 },
  { name: 'Braai Broodjies (2)', category: 'Sides', description: 'Grilled cheese & tomato sandwiches off the coals.', price: 35.00, image_url: '', stock: 80, low_stock_threshold: 15 },
  { name: 'Coleslaw', category: 'Sides', description: 'Creamy homemade coleslaw.', price: 30.00, image_url: '', stock: 60, low_stock_threshold: 10 },
  { name: 'Garlic Bread', category: 'Sides', description: 'Toasted garlic bread (4 slices).', price: 30.00, image_url: '', stock: 60, low_stock_threshold: 10 },
  { name: 'Corn on the Cob', category: 'Sides', description: 'Grilled corn brushed with herb butter.', price: 25.00, image_url: '', stock: 60, low_stock_threshold: 10 },
  // Combos
  { name: 'Family Braai Combo', category: 'Combos', description: 'Feeds 4: boerewors, chicken half, ribs & 2 sides.', price: 450.00, image_url: '', stock: 15, low_stock_threshold: 3 },
  { name: 'Surf & Turf Combo', category: 'Combos', description: 'Grilled snoek + beef braai + pap & sides.', price: 280.00, image_url: '', stock: 20, low_stock_threshold: 5 },
  { name: 'Braai for Two', category: 'Combos', description: 'Chicken half + boerewors + 2 sides + 2 braai broodjies.', price: 220.00, image_url: '', stock: 25, low_stock_threshold: 5 },
];

async function seed() {
  console.log('Seeding menu_items...');

  // Clear existing items
  await sql`DELETE FROM menu_items`;
  console.log('Cleared existing menu items.');

  for (const item of menuItems) {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await sql`
      INSERT INTO menu_items (id, name, description, price, category, image_url, available, stock, low_stock_threshold, created_at)
      VALUES (${id}, ${item.name}, ${item.description}, ${item.price}, ${item.category}, ${item.image_url}, true, ${item.stock}, ${item.low_stock_threshold}, NOW())
    `;
    console.log(`  ✅ ${item.category}: ${item.name} (R${item.price})`);
  }

  const count = await sql`SELECT COUNT(*) FROM menu_items`;
  console.log(`\nMenu seeded: ${count[0].count} items in Neon DB.`);
}

seed().catch(e => {
  console.error('Seed error:', e.message);
  process.exit(1);
});
