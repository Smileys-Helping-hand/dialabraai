import { NextResponse } from 'next/server';
import { sql, getTimestamp } from '@/lib/db';
import { dispatchWebhook } from '@/lib/webhook-dispatcher';
import { logApiCall } from '@/lib/api-logger';

export async function POST(request, { params }) {
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

    const quote = quotes[0];

    await sql`
      UPDATE quotes
      SET status = 'accepted', accepted_at = ${getTimestamp()}
      WHERE id = ${id}
    `;

    (async () => {
      try {
        const apps = await sql`
          SELECT id FROM registered_apps WHERE slug = ${quote.shop_slug}
        `;
        if (apps.length > 0) {
          dispatchWebhook('quote_accepted', {
            quoteId: id,
            shopSlug: quote.shop_slug,
            customerName: quote.customer_name,
            customerPhone: quote.customer_phone,
            customerEmail: quote.customer_email,
          }, apps[0].id);
        }
      } catch (err) {
        console.error('Failed to dispatch webhook for quote acceptance:', err);
      }
    })();

    logApiCall({
      appId: null,
      endpoint: `/api/quotes/${id}/accept`,
      method: 'POST',
      statusCode: 200,
      durationMs: 0,
    });

    return NextResponse.json({ quote: { ...quote, status: 'accepted' } }, { status: 200 });
  } catch (error) {
    console.error('Failed to accept quote:', error.message);
    logApiCall({
      appId: null,
      endpoint: `/api/quotes/${id}/accept`,
      method: 'POST',
      statusCode: 500,
      durationMs: 0,
      errorMsg: error.message,
    });
    return NextResponse.json({ error: 'Failed to accept quote' }, { status: 500 });
  }
}
