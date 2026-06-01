import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    // Get per-app health metrics
    const health = await sql`
      SELECT
        app_id,
        COUNT(*) as total_calls,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as calls_24h,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours' AND status_code >= 500) as errors_24h,
        ROUND(100.0 * COUNT(*) FILTER (WHERE status_code >= 500) / NULLIF(COUNT(*), 0), 2) as error_rate,
        AVG(duration_ms) as avg_duration_ms,
        MAX(created_at) as last_seen
      FROM api_logs
      ${appId ? sql`WHERE app_id = ${appId}` : sql``}
      GROUP BY app_id
    `;

    if (appId && health.length === 0) {
      return NextResponse.json({
        appId,
        status: 'inactive',
        totalCalls: 0,
        calls24h: 0,
        errorRate: 0,
        avgDurationMs: 0,
        lastSeen: null,
      });
    }

    if (appId) {
      const stats = health[0];
      return NextResponse.json({
        appId,
        status: 'active',
        totalCalls: parseInt(stats.total_calls, 10),
        calls24h: parseInt(stats.calls_24h, 10),
        errors24h: parseInt(stats.errors_24h, 10),
        errorRate: parseFloat(stats.error_rate) || 0,
        avgDurationMs: Math.round(parseFloat(stats.avg_duration_ms) || 0),
        lastSeen: stats.last_seen,
      });
    }

    // Return all apps health
    const result = health.map((h) => ({
      appId: h.app_id,
      status: 'active',
      totalCalls: parseInt(h.total_calls, 10),
      calls24h: parseInt(h.calls_24h, 10),
      errors24h: parseInt(h.errors_24h, 10),
      errorRate: parseFloat(h.error_rate) || 0,
      avgDurationMs: Math.round(parseFloat(h.avg_duration_ms) || 0),
      lastSeen: h.last_seen,
    }));

    return NextResponse.json({ health: result });
  } catch (error) {
    console.error('[superadmin/health] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
