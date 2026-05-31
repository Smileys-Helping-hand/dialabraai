import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';

export async function GET(request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const endpoint = searchParams.get('endpoint');
    const statusCode = searchParams.get('statusCode');
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '200', 10);

    let query = sql`SELECT * FROM api_logs WHERE 1=1`;

    if (appId) {
      query = sql`${query} AND app_id = ${appId}`;
    }
    if (endpoint) {
      query = sql`${query} AND endpoint ILIKE ${`%${endpoint}%`}`;
    }
    if (statusCode) {
      query = sql`${query} AND status_code = ${parseInt(statusCode, 10)}`;
    }
    if (fromStr) {
      query = sql`${query} AND created_at >= ${new Date(fromStr)}`;
    }
    if (toStr) {
      query = sql`${query} AND created_at <= ${new Date(toStr)}`;
    }

    const logs = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    // Compute summary stats
    const statsRows = await sql`
      SELECT
        COUNT(*) as total_count,
        ROUND(100.0 * COUNT(*) FILTER (WHERE status_code >= 500) / NULLIF(COUNT(*), 0), 2) as error_rate,
        ROUND(AVG(duration_ms), 0) as avg_duration_ms
      FROM api_logs
      WHERE 1=1
      ${appId ? sql`AND app_id = ${appId}` : sql``}
      ${endpoint ? sql`AND endpoint ILIKE ${`%${endpoint}%`}` : sql``}
      ${statusCode ? sql`AND status_code = ${parseInt(statusCode, 10)}` : sql``}
      ${fromStr ? sql`AND created_at >= ${new Date(fromStr)}` : sql``}
      ${toStr ? sql`AND created_at <= ${new Date(toStr)}` : sql``}
    `;

    const stats = statsRows[0] || { total_count: 0, error_rate: 0, avg_duration_ms: 0 };

    return NextResponse.json({ logs, stats });
  } catch (error) {
    console.error('[superadmin/logs] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
