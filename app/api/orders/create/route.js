import { NextResponse } from 'next/server';
import { sql, generateId, getTimestamp } from '@/lib/db';
import { demoStore } from '@/lib/demo-store';
import { dispatchWebhook } from '@/lib/webhook-dispatcher';
import { logApiCall } from '@/lib/api-logger';

export async function POST(request) {
  const body = await request.json();
  const { items, customer_name, customer_phone, customer_email, notes, total_price, userId, shop_slug = 'default' } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  if (!customer_name || !customer_phone) {
    return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
  }

  const orderId = generateId();
  const payload = {
    id: orderId,
    items,
    total_price: Number(total_price) || 0,
    customer_name,
    customer_phone,
    customer_email: customer_email || '',
    notes: notes || '',
    status: 'pending',
    paid: false,
    created_at: getTimestamp(),
    userId: userId || null,
    shop_slug: shop_slug || 'default',
  };

  if (sql) {
    try {
      await sql`
        INSERT INTO orders (id, items, total_price, customer_name, customer_phone, customer_email, notes, status, paid, created_at, user_id, shop_slug)
        VALUES (${orderId}, ${JSON.stringify(items)}::jsonb, ${payload.total_price}, ${customer_name}, ${customer_phone}, ${payload.customer_email}, ${payload.notes}, 'pending', false, ${payload.created_at}, ${userId || null}, ${payload.shop_slug})
      `;

      // Fire-and-forget: get the app ID for this shop and dispatch webhook
      (async () => {
        try {
          const apps = await sql`
            SELECT id FROM registered_apps WHERE slug = ${payload.shop_slug}
          `;
          if (apps.length > 0) {
            dispatchWebhook('new_order', {
              orderId,
              shopSlug: payload.shop_slug,
              totalPrice: payload.total_price,
              customerName: customer_name,
              customerPhone: customer_phone,
              itemCount: items.length,
            }, apps[0].id);
          }
        } catch (err) {
          console.error('Failed to dispatch webhook for new order:', err);
        }
      })();

      // Log the API call (fire-and-forget)
      logApiCall({
        appId: null,
        endpoint: '/api/orders/create',
        method: 'POST',
        statusCode: 200,
        durationMs: 0,
      });

      return NextResponse.json({ id: orderId }, { status: 200 });
    } catch (error) {
      console.error('DB order insert failed:', error.message);
      logApiCall({
        appId: null,
        endpoint: '/api/orders/create',
        method: 'POST',
        statusCode: 500,
        durationMs: 0,
        errorMsg: error.message,
      });
      return NextResponse.json({ error: 'Failed to save your order. Please try again.' }, { status: 500 });
    }
  }

  // No DB configured — demo/dev fallback only
  const demoOrderId = demoStore.createOrder(payload);
  return NextResponse.json({ id: demoOrderId }, { status: 200 });
}
