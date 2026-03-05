import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { demoStore } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!sql) {
    return NextResponse.json(demoStore.getAllInventory());
  }

  try {
    const rows = await sql`SELECT * FROM menu_items ORDER BY category, name`;
    return NextResponse.json(rows.map(r => ({ ...r, price: Number(r.price) })));
  } catch (error) {
    console.error('Failed to fetch inventory', error);
    return NextResponse.json(demoStore.getAllInventory());
  }
}

export async function POST(request) {
  const body = await request.json();
  const { id, stock } = body || {};

  if (!id || stock === undefined) {
    return NextResponse.json({ error: 'Item ID and stock are required' }, { status: 400 });
  }

  if (typeof id === 'number' || id.toString().startsWith('demo-')) {
    const updated = demoStore.updateStock(id, stock);
    if (updated) return NextResponse.json({ inventory: demoStore.getInventory(id) });
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  if (!sql) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    await sql`UPDATE menu_items SET stock = ${stock} WHERE id = ${id}`;
    const [inventory] = await sql`SELECT * FROM menu_items WHERE id = ${id}`;
    return NextResponse.json({ inventory });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
