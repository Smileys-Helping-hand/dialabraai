import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { demoStore } from '@/lib/demo-store';
import { dispatchWebhook } from '@/lib/webhook-dispatcher';

const allowedStatuses = ['pending', 'preparing', 'ready', 'completed'];

export async function POST(request) {
  const body = await request.json();
  const { id, status, shop_slug = 'default' } = body || {};

  if (!id || !status) {
    return NextResponse.json({ error: 'Order id and status are required.' }, { status: 400 });
  }

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
  }

  if (id.startsWith('demo-')) {
    const updated = demoStore.updateOrderStatus(id, status);
    if (updated) return NextResponse.json({ order: demoStore.getOrder(id) });
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!sql) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
  }

  try {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${id} AND COALESCE(shop_slug, 'default') = ${shop_slug || 'default'}`;
    const [row] = await sql`SELECT * FROM orders WHERE id = ${id}`;
    const order = { ...row, total_price: Number(row.total_price), created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at };

    // Fire-and-forget: dispatch webhook
    (async () => {
      try {
        const apps = await sql`
          SELECT id FROM registered_apps WHERE slug = ${shop_slug || 'default'}
        `;
        if (apps.length > 0) {
          dispatchWebhook('order_status_change', {
            orderId: id,
            newStatus: status,
            shopSlug: shop_slug || 'default',
          }, apps[0].id);
        }
      } catch (err) {
        console.error('Failed to dispatch webhook for order status change:', err);
      }
    })();

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
