import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!sql) {
    return NextResponse.json({
      totalShops: 1, activeShops: 1, totalOrders: 0,
      todayOrders: 0, weekOrders: 0, totalRevenue: 0,
      todayRevenue: 0, weekRevenue: 0, pendingOrders: 0,
      recentShops: [], topShops: [],
    });
  }

  try {
    const [shopStats, orderStats, todayStats, weekStats, recentShops, topShops] = await Promise.all([
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
    ]);

    return NextResponse.json({
      totalShops:   Number(shopStats[0]?.total   || 0),
      activeShops:  Number(shopStats[0]?.active  || 0),
      totalOrders:  Number(orderStats[0]?.total   || 0),
      totalRevenue: Number(orderStats[0]?.revenue || 0),
      pendingOrders:Number(orderStats[0]?.pending || 0),
      todayOrders:  Number(todayStats[0]?.total   || 0),
      todayRevenue: Number(todayStats[0]?.revenue || 0),
      weekOrders:   Number(weekStats[0]?.total    || 0),
      weekRevenue:  Number(weekStats[0]?.revenue  || 0),
      recentShops:  recentShops.map(r => ({ slug: r.slug, name: r.name, createdAt: r.created_at })),
      topShops:     topShops.map(r => ({ slug: r.slug, name: r.name, orders: Number(r.order_count), revenue: Number(r.revenue) })),
    });
  } catch (err) {
    console.error('Superadmin stats error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
