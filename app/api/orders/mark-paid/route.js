import { NextResponse } from 'next/server';
import { docClient, TABLES, updateItem, getItem } from '@/lib/dynamodb';
import { demoStore } from '@/lib/demo-store';

export async function POST(request) {
  const body = await request.json();
  const { id, paid = true } = body || {};

  if (!id) {
    return NextResponse.json({ error: 'Order id is required.' }, { status: 400 });
  }

  // Handle demo orders
  if (id.startsWith('demo-')) {
    const updated = demoStore.markOrderPaid(id, paid);
    if (updated) {
      const order = demoStore.getOrder(id);
      console.log('📦 Demo order payment status updated:', id, paid);
      return NextResponse.json({ order });
    }
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!docClient) {
    return NextResponse.json(
      { error: 'DynamoDB is not configured and order is not a demo order.' },
      { status: 500 }
    );
  }

  try {
    await updateItem(TABLES.ORDERS, { id }, { paid });
    const order = await getItem(TABLES.ORDERS, { id });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
