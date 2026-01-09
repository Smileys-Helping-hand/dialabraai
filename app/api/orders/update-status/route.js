import { NextResponse } from 'next/server';
import { docClient, TABLES, updateItem, getItem } from '@/lib/dynamodb';
import { demoStore } from '@/lib/demo-store';

const allowedStatuses = ['pending', 'preparing', 'ready', 'completed'];

export async function POST(request) {
  const body = await request.json();
  const { id, status } = body || {};

  if (!id || !status) {
    return NextResponse.json({ error: 'Order id and status are required.' }, { status: 400 });
  }

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
  }

  // Handle demo orders
  if (id.startsWith('demo-')) {
    const updated = demoStore.updateOrderStatus(id, status);
    if (updated) {
      const order = demoStore.getOrder(id);
      console.log('📦 Demo order status updated:', id, status);
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
    await updateItem(TABLES.ORDERS, { id }, { status });
    const order = await getItem(TABLES.ORDERS, { id });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
