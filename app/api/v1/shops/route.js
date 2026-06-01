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
        endpoint: '/api/v1/shops',
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
        endpoint: '/api/v1/shops',
        method: 'GET',
        statusCode: 401,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!scopes.includes('shops:read')) {
      logApiCall({
        appId,
        keyId,
        endpoint: '/api/v1/shops',
        method: 'GET',
        statusCode: 403,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the app's shop(s)
    const shops = await sql`
      SELECT * FROM shops WHERE id = ${appId} OR slug = (
        SELECT slug FROM registered_apps WHERE id = ${appId}
      )
    `;

    logApiCall({
      appId,
      keyId,
      endpoint: '/api/v1/shops',
      method: 'GET',
      statusCode: 200,
      durationMs: Date.now() - start,
    });

    return NextResponse.json({ shops });
  } catch (error) {
    console.error('[api/v1/shops] GET error:', error);
    logApiCall({
      appId: null,
      endpoint: '/api/v1/shops',
      method: 'GET',
      statusCode: 500,
      durationMs: Date.now() - start,
      errorMsg: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
