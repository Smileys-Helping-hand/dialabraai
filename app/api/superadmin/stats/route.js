import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!sql) {
    return NextResponse.json({
      totalShops: 1, activeShops: 1, totalOrders: 0,
      todayOrders: 0, weekOrders: 0, totalRevenue: 0,
      todayRevenue: 0, weekRevenue: 0, pendingOrders: 0,
      totalOwners: 0, activeOwners: 0, premiumOwners: 0, freeOwners: 0,
      totalCustomers: 0,
      recentShops: [], topShops: [],
    });
  }

  try {
    const [shopStats, orderStats, todayStats, weekStats, recentShops, topShops, ownerStats, customerStats] = await Promise.all([
      sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM shops`,
      sql`SELECT COUNT(*) as total, COALESCE(SUM(total_price), 0) as revenue, COUNT(*) FILTER (WHERE status = 'pending') as pending FROM orders`,
      sql`SELECT COUNT(*) as total, COALESCE(SUM(total_price), 0) as revenue FROM orders WHERE created_at >= NOW() - INTERVAL '1 day'`,
      sql`SELECT COUNT(*) as total, COALESCE(SUM(total_price), 0) as revenue FROM orders WHERE created_at >= NOW() - INTERVAL '7 days'`,
      sql`SELECT slug, name, created_at FROM shops ORDER BY created_at DESC LIMIT 5`,
      sql`
        SELECT s.slug, s.name, COUNT(o.id) as order_count, COALESCE(SUM(o.total_price), 0) as revenue
        FROM shops s
        LEFT JOIN orders o ON o.shop_slug = s.slug
        GROUP BY s.slug, s.name
        ORDER BY order_count DESC
        LIMIT 5
      `,
      sql`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'active')::int as active,
          COUNT(*) FILTER (WHERE plan = 'pro' OR plan = 'enterprise')::int as premium,
          COUNT(*) FILTER (WHERE plan = 'free')::int as free_plan
        FROM shop_owners
      `.catch(() => [{ total: 0, active: 0, premium: 0, free_plan: 0 }]),
      sql`
        SELECT COUNT(DISTINCT customer_phone)::int as total,
               COUNT(*)::int as total_orders
        FROM orders
        WHERE customer_phone IS NOT NULL AND customer_phone != ''
      `.catch(() => [{ total: 0, total_orders: 0 }]),
    ]);

    return NextResponse.json({
      totalShops:    Number(shopStats[0]?.total   || 0),
      activeShops:   Number(shopStats[0]?.active  || 0),
      totalOrders:   Number(orderStats[0]?.total   || 0),
      totalRevenue:  Number(orderStats[0]?.revenue || 0),
      pendingOrders: Number(orderStats[0]?.pending || 0),
      todayOrders:   Number(todayStats[0]?.total   || 0),
      todayRevenue:  Number(todayStats[0]?.revenue || 0),
      weekOrders:    Number(weekStats[0]?.total    || 0),
      weekRevenue:   Number(weekStats[0]?.revenue  || 0),
      totalOwners:   Number(ownerStats[0]?.total    || 0),
      activeOwners:  Number(ownerStats[0]?.active   || 0),
      premiumOwners: Number(ownerStats[0]?.premium  || 0),
      freeOwners:    Number(ownerStats[0]?.free_plan || 0),
      totalCustomers: Number(customerStats[0]?.total || 0),
      recentShops:   recentShops.map(r => ({ slug: r.slug, name: r.name, createdAt: r.created_at })),
      topShops:      topShops.map(r => ({ slug: r.slug, name: r.name, orders: Number(r.order_count), revenue: Number(r.revenue) })),
    });
  } catch (err) {
    console.error('Superadmin stats error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
