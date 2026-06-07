import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logApiCall } from '@/lib/api-logger';

export async function GET(request, { params }) {
  const { id } = params;

  if (!sql) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  try {
    const quotes = await sql`
      SELECT * FROM quotes WHERE id = ${id}
    `;

    if (quotes.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    logApiCall({
      appId: null,
      endpoint: `/api/quotes/${id}`,
      method: 'GET',
      statusCode: 200,
      durationMs: 0,
    });

    return NextResponse.json({ quote: quotes[0] }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch quote:', error.message);
    logApiCall({
      appId: null,
      endpoint: `/api/quotes/${id}`,
      method: 'GET',
      statusCode: 500,
      durationMs: 0,
      errorMsg: error.message,
    });
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}
