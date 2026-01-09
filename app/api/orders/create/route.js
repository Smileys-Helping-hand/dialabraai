import { NextResponse } from 'next/server';
import { docClient, TABLES, createItem, generateId, getTimestamp } from '@/lib/dynamodb';
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
    userId: userId || null, // Link to user account if provided
  };

  // If DynamoDB is configured, use it
  if (docClient) {
    try {
      await createItem(TABLES.ORDERS, payload);
      return NextResponse.json({ id: orderId }, { status: 200 });
    } catch (error) {
      console.error('DynamoDB order insert failed', error);
      // Fall back to demo mode
      console.log('⚠️  DynamoDB not available - creating demo order');
      const demoOrderId = demoStore.createOrder(payload);
      return NextResponse.json({ id: demoOrderId }, { status: 200 });
    }
  }

  // Fallback: use demo mode (in-memory storage)
  const demoOrderId = demoStore.createOrder(payload);
  return NextResponse.json({ id: demoOrderId }, { status: 200 });
}
