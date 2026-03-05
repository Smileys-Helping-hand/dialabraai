import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { demoStore } from '@/lib/demo-store';

export async function POST(request) {
  const body = await request.json();
  const { id } = body || {};

  if (!id) {
    return NextResponse.json({ error: 'Order id is required.' }, { status: 400 });
  }

  if (id.startsWith('demo-')) {
    const deleted = demoStore.deleteOrder(id);
    if (deleted) return NextResponse.json({ success: true });
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!sql) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
  }

  try {
    await sql`DELETE FROM orders WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
