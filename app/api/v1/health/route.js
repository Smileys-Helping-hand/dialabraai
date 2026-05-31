import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';
import { validateApiKey } from '@/lib/api-keys.js';
import { logApiCall } from '@/lib/api-logger.js';

export async function GET(request) {
  const start = Date.now();
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const { valid, appId, keyId } = await validateApiKey(token);

    if (!valid) {
      logApiCall({
        appId,
        keyId,
        endpoint: '/api/v1/health',
        method: 'GET',
        statusCode: 401,
        durationMs: Date.now() - start,
      });
      return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
    }

    logApiCall({
      appId,
      keyId,
      endpoint: '/api/v1/health',
      method: 'GET',
      statusCode: 200,
      durationMs: Date.now() - start,
    });

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      appId,
    });
  } catch (error) {
    console.error('[api/v1/health] GET error:', error);
    logApiCall({
      appId: null,
      endpoint: '/api/v1/health',
      method: 'GET',
      statusCode: 500,
      durationMs: Date.now() - start,
      errorMsg: error.message,
    });
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
