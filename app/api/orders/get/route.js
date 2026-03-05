import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { demoStore } from '@/lib/demo-store';

function normaliseOrder(row) {
  if (!row) return null;
  return {
    ...row,
    total_price: Number(row.total_price),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  if (id.startsWith('demo-')) {
    const demoOrder = demoStore.getOrder(id);
    if (demoOrder) return NextResponse.json(demoOrder);
  }

  if (!sql) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 404 });
  }

  try {
    const [row] = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (!row) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(normaliseOrder(row));
  } catch (error) {
    console.error('Failed to fetch order', error);
    return NextResponse.json({ error: 'Unable to load order' }, { status: 500 });
  }
}
