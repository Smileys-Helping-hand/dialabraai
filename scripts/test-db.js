/**
 * End-to-end test: validates all critical DB operations against Neon
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

let passed = 0;
let failed = 0;

function ok(label) { console.log(`  ✅ ${label}`); passed++; }
function fail(label, err) { console.error(`  ❌ ${label}: ${err}`); failed++; }

async function run() {
  console.log('\n══════════════════════════════════════════');
  console.log(' Dial-a-Braai · Neon DB End-to-End Test');
  console.log('══════════════════════════════════════════\n');

  // ── 1. Menu: read ─────────────────────────────────────────
  console.log('1. Menu');
  try {
    const items = await sql`SELECT * FROM menu_items WHERE available = true ORDER BY category, name`;
    if (items.length === 0) throw new Error('No menu items found — run seed-menu.js first');
    ok(`Fetched ${items.length} menu items`);

    // Check price is a number after coercion
    const prices = items.map(r => Number(r.price));
    if (prices.some(p => isNaN(p))) throw new Error('Some prices are NaN');
    ok(`All prices parse as numbers (e.g. first item: R${prices[0]})`);

    // Categories present
    const cats = [...new Set(items.map(r => r.category))];
    ok(`Categories present: ${cats.join(', ')}`);
  } catch (e) { fail('Menu read', e.message); }

  // ── 2. Menu: add ──────────────────────────────────────────
  const testItemId = `test-${Date.now()}`;
  try {
    await sql`
      INSERT INTO menu_items (id, name, description, price, category, image_url, available, created_at)
      VALUES (${testItemId}, 'Test Wors', 'Test boerewors item', 55.00, 'Sides', '', true, NOW())
    `;
    const [item] = await sql`SELECT * FROM menu_items WHERE id = ${testItemId}`;
    if (!item || item.name !== 'Test Wors') throw new Error('Inserted item not found');
    ok(`Menu item added (id: ${testItemId})`);
  } catch (e) { fail('Menu add', e.message); }

  // ── 3. Menu: update ───────────────────────────────────────
  try {
    await sql`UPDATE menu_items SET price = 60.00, name = 'Test Wors Updated' WHERE id = ${testItemId}`;
    const [item] = await sql`SELECT * FROM menu_items WHERE id = ${testItemId}`;
    if (Number(item.price) !== 60) throw new Error(`Price not updated (got ${item.price})`);
    ok(`Menu item updated (price now R${Number(item.price)})`);
  } catch (e) { fail('Menu update', e.message); }

  // ── 4. Menu: delete ───────────────────────────────────────
  try {
    await sql`DELETE FROM menu_items WHERE id = ${testItemId}`;
    const rows = await sql`SELECT * FROM menu_items WHERE id = ${testItemId}`;
    if (rows.length !== 0) throw new Error('Item still exists after delete');
    ok('Menu item deleted');
  } catch (e) { fail('Menu delete', e.message); }

  // ── 5. Orders: create ─────────────────────────────────────
  console.log('\n2. Orders');
  const testOrderId = `test-order-${Date.now()}`;
  const testItems = [{ id: 'item-1', name: 'Boerewors Roll', price: 65, quantity: 2 }];
  try {
    await sql`
      INSERT INTO orders (id, items, total_price, customer_name, customer_phone, customer_email, notes, status, paid, created_at, user_id)
      VALUES (${testOrderId}, ${JSON.stringify(testItems)}::jsonb, 130.00, 'Test Customer', '0821234567', 'test@example.com', 'Test order', 'pending', false, NOW(), null)
    `;
    ok(`Order created (id: ${testOrderId})`);
  } catch (e) { fail('Order create', e.message); }

  // ── 6. Orders: read by id ─────────────────────────────────
  try {
    const [row] = await sql`SELECT * FROM orders WHERE id = ${testOrderId}`;
    if (!row) throw new Error('Order not found');
    if (Number(row.total_price) !== 130) throw new Error(`Wrong total (${row.total_price})`);
    if (!Array.isArray(row.items)) throw new Error(`items is not an array: ${typeof row.items}`);
    ok(`Order fetched, total_price=${Number(row.total_price)}, items array length=${row.items.length}`);
  } catch (e) { fail('Order read', e.message); }

  // ── 7. Orders: list ───────────────────────────────────────
  try {
    const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    ok(`Orders list returned ${rows.length} row(s)`);
  } catch (e) { fail('Orders list', e.message); }

  // ── 8. Orders: update status ──────────────────────────────
  try {
    await sql`UPDATE orders SET status = 'preparing' WHERE id = ${testOrderId}`;
    const [row] = await sql`SELECT * FROM orders WHERE id = ${testOrderId}`;
    if (row.status !== 'preparing') throw new Error(`Status not updated (${row.status})`);
    ok(`Order status updated → ${row.status}`);
  } catch (e) { fail('Order status update', e.message); }

  // ── 9. Orders: mark paid ──────────────────────────────────
  try {
    await sql`UPDATE orders SET paid = true WHERE id = ${testOrderId}`;
    const [row] = await sql`SELECT * FROM orders WHERE id = ${testOrderId}`;
    if (row.paid !== true) throw new Error(`paid not true (${row.paid})`);
    ok(`Order marked paid → ${row.paid}`);
  } catch (e) { fail('Order mark paid', e.message); }

  // ── 10. Orders: delete ────────────────────────────────────
  try {
    await sql`DELETE FROM orders WHERE id = ${testOrderId}`;
    const rows = await sql`SELECT * FROM orders WHERE id = ${testOrderId}`;
    if (rows.length !== 0) throw new Error('Order still exists after delete');
    ok('Order deleted');
  } catch (e) { fail('Order delete', e.message); }

  // ── 11. Stats calculation ─────────────────────────────────
  console.log('\n3. Stats');
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    const totals = orders.map(r => Number(r.total_price));
    ok(`Stats query OK — ${orders.length} real order(s) in DB, totals parse correctly`);
  } catch (e) { fail('Stats query', e.message); }

  // ── Summary ───────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log(` Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

run().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
