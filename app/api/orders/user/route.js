import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

function normaliseOrder(row) {
  return {
    ...row,
    total_price: Number(row.total_price),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  if (!sql) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const rows = await sql`
      SELECT * FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows.map(normaliseOrder));
  } catch (error) {
    console.error('Failed to fetch user orders', error);
    return NextResponse.json({ error: 'Unable to load order history' }, { status: 500 });
  }
}
