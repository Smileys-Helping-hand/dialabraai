import { NextResponse } from 'next/server';
import { sql, generateId, getTimestamp } from '@/lib/db';
import { dispatchWebhook } from '@/lib/webhook-dispatcher';
import { logApiCall } from '@/lib/api-logger';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
  const body = await request.json();
  const {
    items,
    customer_name,
    customer_phone,
    customer_email,
    customer_id,
    notes,
    shop_slug = 'default',
  } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Items are required' }, { status: 400 });
  }

  if (!customer_name || !customer_phone || !customer_email) {
    return NextResponse.json(
      { error: 'Customer name, phone, and email are required' },
      { status: 400 }
    );
  }

  const quoteId = generateId();
  const payload = {
    id: quoteId,
    items,
    customer_name,
    customer_phone,
    customer_email,
    customer_id: customer_id || null,
    notes: notes || '',
    status: 'pending',
    created_at: getTimestamp(),
    shop_slug: shop_slug || 'default',
  };

  if (sql) {
    try {
      await sql`
        INSERT INTO quotes (
          id, shop_slug, customer_id, customer_email, customer_name, customer_phone,
          items, notes, status, created_at
        )
        VALUES (
          ${quoteId}, ${shop_slug}, ${customer_id || null}, ${customer_email},
          ${customer_name}, ${customer_phone}, ${JSON.stringify(items)}::jsonb,
          ${notes}, 'pending', ${payload.created_at}
        )
      `;

      (async () => {
        try {
          const apps = await sql`
            SELECT id FROM registered_apps WHERE slug = ${payload.shop_slug}
          `;
          if (apps.length > 0) {
            dispatchWebhook('new_quote_request', {
              quoteId,
              shopSlug: payload.shop_slug,
              customerName: customer_name,
              customerPhone: customer_phone,
              customerEmail: customer_email,
              itemCount: items.length,
            }, apps[0].id);
          }

          // Send customer confirmation notification
          await createNotification({
            userEmail: customer_email,
            userType: 'customer',
            type: 'quote_request_sent',
            title: 'Quote request sent',
            message: `Your quote request for ${items.length} item${items.length !== 1 ? 's' : ''} has been sent. You'll receive a quote within 24 hours.`,
            relatedQuoteId: quoteId,
          });
        } catch (err) {
          console.error('Failed to dispatch webhook for new quote:', err);
        }
      })();

      logApiCall({
        appId: null,
        endpoint: '/api/quotes/create',
        method: 'POST',
        statusCode: 200,
        durationMs: 0,
      });

      return NextResponse.json({ id: quoteId }, { status: 200 });
    } catch (error) {
      console.error('DB quote insert failed:', error.message);
      logApiCall({
        appId: null,
        endpoint: '/api/quotes/create',
        method: 'POST',
        statusCode: 500,
        durationMs: 0,
        errorMsg: error.message,
      });
      return NextResponse.json(
        { error: 'Failed to create quote request. Please try again.' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ id: quoteId }, { status: 200 });
}
