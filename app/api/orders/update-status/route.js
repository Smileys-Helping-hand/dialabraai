import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { demoStore } from '@/lib/demo-store';

const allowedStatuses = ['pending', 'preparing', 'ready', 'completed'];

export async function POST(request) {
  const body = await request.json();
  const { id, status } = body || {};

  if (!id || !status) {
    return NextResponse.json({ error: 'Order id and status are required.' }, { status: 400 });
  }

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
  }

  if (id.startsWith('demo-')) {
    const updated = demoStore.updateOrderStatus(id, status);
    if (updated) return NextResponse.json({ order: demoStore.getOrder(id) });
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!sql) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
  }

  try {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
    const [row] = await sql`SELECT * FROM orders WHERE id = ${id}`;
    const order = { ...row, total_price: Number(row.total_price), created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at };
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
