import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { dispatchWebhook } from '@/lib/webhook-dispatcher';
import { logApiCall } from '@/lib/api-logger';

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { quoted_price } = body || {};

  if (typeof quoted_price !== 'number' || quoted_price < 0) {
    return NextResponse.json({ error: 'Valid quoted_price is required' }, { status: 400 });
  }

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
      SET shop_quoted_price = ${quoted_price}, status = 'quoted'
      WHERE id = ${id}
    `;

    (async () => {
      try {
        const apps = await sql`
          SELECT id FROM registered_apps WHERE slug = ${quote.shop_slug}
        `;
        if (apps.length > 0) {
          dispatchWebhook('quote_ready', {
            quoteId: id,
            shopSlug: quote.shop_slug,
            customerName: quote.customer_name,
            customerPhone: quote.customer_phone,
            customerEmail: quote.customer_email,
            quotedPrice: quoted_price,
          }, apps[0].id);
        }
      } catch (err) {
        console.error('Failed to dispatch webhook for quote ready:', err);
      }
    })();

    logApiCall({
      appId: null,
      endpoint: `/api/quotes/${id}/update-price`,
      method: 'POST',
      statusCode: 200,
      durationMs: 0,
    });

    return NextResponse.json(
      { quote: { ...quote, shop_quoted_price: quoted_price, status: 'quoted' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update quote price:', error.message);
    logApiCall({
      appId: null,
      endpoint: `/api/quotes/${id}/update-price`,
      method: 'POST',
      statusCode: 500,
      durationMs: 0,
      errorMsg: error.message,
    });
    return NextResponse.json({ error: 'Failed to update quote price' }, { status: 500 });
  }
}
