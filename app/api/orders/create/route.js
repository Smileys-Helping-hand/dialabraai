import { NextResponse } from 'next/server';
import { sql, generateId, getTimestamp } from '@/lib/db';
import { demoStore } from '@/lib/demo-store';

export async function POST(request) {
  const body = await request.json();
  const { items, customer_name, customer_phone, customer_email, notes, total_price, userId } = body || {};

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
  };

  if (sql) {
    try {
      await sql`
        INSERT INTO orders (id, items, total_price, customer_name, customer_phone, customer_email, notes, status, paid, created_at, user_id)
        VALUES (${orderId}, ${JSON.stringify(items)}::jsonb, ${payload.total_price}, ${customer_name}, ${customer_phone}, ${payload.customer_email}, ${payload.notes}, 'pending', false, ${payload.created_at}, ${userId || null})
      `;
      return NextResponse.json({ id: orderId }, { status: 200 });
    } catch (error) {
      console.error('DB order insert failed:', error.message);
      // Return the error so the customer knows the order wasn't saved
      return NextResponse.json({ error: 'Failed to save your order. Please try again.' }, { status: 500 });
    }
  }

  // No DB configured — demo/dev fallback only
  const demoOrderId = demoStore.createOrder(payload);
  return NextResponse.json({ id: demoOrderId }, { status: 200 });
}
