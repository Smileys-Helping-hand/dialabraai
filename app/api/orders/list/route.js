import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { demoStore } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

// Normalise row from Postgres (NUMERIC → number, TIMESTAMPTZ → ISO string)
function normaliseOrder(row) {
  return {
    ...row,
    total_price: Number(row.total_price),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function GET() {
  if (!sql) {
    return NextResponse.json(demoStore.getAllOrders());
  }

  try {
    const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    // Normalise Postgres types for the frontend
    const orders = rows.map(normaliseOrder);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders', error);
    return NextResponse.json(demoStore.getAllOrders());
  }
}
