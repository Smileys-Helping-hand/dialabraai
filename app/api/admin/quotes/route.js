import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logApiCall } from '@/lib/api-logger';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shopSlug = searchParams.get('shop_slug');
  const status = searchParams.get('status');

  if (!shopSlug) {
    return NextResponse.json({ error: 'shop_slug is required' }, { status: 400 });
  }

  if (!sql) {
    return NextResponse.json({ quotes: [] }, { status: 200 });
  }

  try {
    let query = 'SELECT * FROM quotes WHERE shop_slug = $1';
    const params = [shopSlug];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const quotes = await sql(query, params);

    logApiCall({
      appId: null,
      endpoint: '/api/admin/quotes',
      method: 'GET',
      statusCode: 200,
      durationMs: 0,
    });

    return NextResponse.json({ quotes: quotes || [] }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch quotes:', error.message);
    logApiCall({
      appId: null,
      endpoint: '/api/admin/quotes',
      method: 'GET',
      statusCode: 500,
      durationMs: 0,
      errorMsg: error.message,
    });
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
