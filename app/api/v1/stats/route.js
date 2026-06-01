import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';
import { validateApiKey } from '@/lib/api-keys.js';
import { logApiCall } from '@/lib/api-logger.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const start = Date.now();
  try {
    if (!sql) {
      logApiCall({
        appId: null,
        endpoint: '/api/v1/stats',
        method: 'GET',
        statusCode: 503,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const { valid, appId, scopes, keyId } = await validateApiKey(token);

    if (!valid) {
      logApiCall({
        appId,
        keyId,
        endpoint: '/api/v1/stats',
        method: 'GET',
        statusCode: 401,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!scopes.includes('stats:read')) {
      logApiCall({
        appId,
        keyId,
        endpoint: '/api/v1/stats',
        method: 'GET',
        statusCode: 403,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the app's shop slug
    const appData = await sql`
      SELECT slug FROM registered_apps WHERE id = ${appId}
    `;

    if (appData.length === 0) {
      logApiCall({
        appId,
        keyId,
        endpoint: '/api/v1/stats',
        method: 'GET',
        statusCode: 404,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const shopSlug = appData[0].slug;

    const stats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as orders_today,
        ROUND(CAST(SUM(total_price) FILTER (WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed') AS NUMERIC), 2) as revenue_today,
        COUNT(*) FILTER (WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE)) as orders_week,
        ROUND(CAST(SUM(total_price) FILTER (WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE) AND status = 'completed') AS NUMERIC), 2) as revenue_week,
        COUNT(*) as orders_total,
        ROUND(CAST(SUM(total_price) FILTER (WHERE status = 'completed') AS NUMERIC), 2) as revenue_total
      FROM orders
      WHERE shop_slug = ${shopSlug}
    `;

    const result = stats[0] || {
      orders_today: 0,
      revenue_today: 0,
      orders_week: 0,
      revenue_week: 0,
      orders_total: 0,
      revenue_total: 0,
    };

    logApiCall({
      appId,
      keyId,
      endpoint: '/api/v1/stats',
      method: 'GET',
      statusCode: 200,
      durationMs: Date.now() - start,
    });

    return NextResponse.json({
      stats: {
        ordersToday: parseInt(result.orders_today, 10),
        revenueToday: parseFloat(result.revenue_today) || 0,
        ordersWeek: parseInt(result.orders_week, 10),
        revenueWeek: parseFloat(result.revenue_week) || 0,
        ordersTotal: parseInt(result.orders_total, 10),
        revenueTotal: parseFloat(result.revenue_total) || 0,
      },
    });
  } catch (error) {
    console.error('[api/v1/stats] GET error:', error);
    logApiCall({
      appId: null,
      endpoint: '/api/v1/stats',
      method: 'GET',
      statusCode: 500,
      durationMs: Date.now() - start,
      errorMsg: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
