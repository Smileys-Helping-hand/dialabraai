import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!sql) return NextResponse.json({ error: 'No DB' }, { status: 503 });

  try {
    const { searchParams } = new URL(req.url);
    const shop   = searchParams.get('shop');
    const search = searchParams.get('search');
    const limit  = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    // Derive customers from orders — grouped by phone + shop
    const rows = await sql`
      SELECT
        MIN(id)                          AS sample_order_id,
        customer_name,
        customer_phone,
        customer_email,
        shop_slug,
        COUNT(*)::int                    AS order_count,
        COALESCE(SUM(total_price), 0)    AS total_spent,
        MIN(created_at)                  AS first_order_at,
        MAX(created_at)                  AS last_order_at,
        COUNT(*) FILTER (WHERE status = 'pending')   ::int AS pending_count,
        COUNT(*) FILTER (WHERE status = 'completed') ::int AS completed_count
      FROM orders
      WHERE
        (${shop   ?? null} IS NULL OR shop_slug        = ${shop   ?? ''})
        AND
        (${search ?? null} IS NULL OR (
          customer_name  ILIKE ${'%' + (search ?? '') + '%'} OR
          customer_phone ILIKE ${'%' + (search ?? '') + '%'} OR
          customer_email ILIKE ${'%' + (search ?? '') + '%'}
        ))
      GROUP BY customer_name, customer_phone, customer_email, shop_slug
      ORDER BY last_order_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json(rows.map(r => ({
      name: r.customer_name,
      phone: r.customer_phone,
      email: r.customer_email,
      shopSlug: r.shop_slug,
      orderCount: r.order_count,
      totalSpent: Number(r.total_spent),
      firstOrderAt: r.first_order_at,
      lastOrderAt: r.last_order_at,
      pendingCount: r.pending_count,
      completedCount: r.completed_count,
    })));
  } catch (err) {
    console.error('Customers GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
