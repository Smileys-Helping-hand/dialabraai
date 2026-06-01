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
        endpoint: '/api/v1/orders',
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
        endpoint: '/api/v1/orders',
        method: 'GET',
        statusCode: 401,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!scopes.includes('orders:read')) {
      logApiCall({
        appId,
        keyId,
        endpoint: '/api/v1/orders',
        method: 'GET',
        statusCode: 403,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    // Get the app's shop slug(s)
    const appData = await sql`
      SELECT slug FROM registered_apps WHERE id = ${appId} AND type = 'owned'
    `;

    if (appData.length === 0) {
      logApiCall({
        appId,
        keyId,
        endpoint: '/api/v1/orders',
        method: 'GET',
        statusCode: 404,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    let query = sql`SELECT * FROM orders WHERE shop_slug = ${appData[0].slug}`;

    if (status) {
      query = sql`${query} AND status = ${status}`;
    }
    if (fromStr) {
      query = sql`${query} AND created_at >= ${new Date(fromStr)}`;
    }
    if (toStr) {
      query = sql`${query} AND created_at <= ${new Date(toStr)}`;
    }

    const orders = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    logApiCall({
      appId,
      keyId,
      endpoint: '/api/v1/orders',
      method: 'GET',
      statusCode: 200,
      durationMs: Date.now() - start,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[api/v1/orders] GET error:', error);
    logApiCall({
      appId: null,
      endpoint: '/api/v1/orders',
      method: 'GET',
      statusCode: 500,
      durationMs: Date.now() - start,
      errorMsg: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
