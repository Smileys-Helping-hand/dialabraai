import { NextResponse } from 'next/server';
import { docClient, TABLES, getItem } from '@/lib/dynamodb';
import { demoStore } from '@/lib/demo-store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  // Check for demo order first
  if (id.startsWith('demo-')) {
    const demoOrder = demoStore.getOrder(id);
    if (demoOrder) {
      return NextResponse.json(demoOrder);
    }
  }

  // If DynamoDB is configured, use it
  if (!docClient) {
    return NextResponse.json({ error: 'DynamoDB not configured and order not found' }, { status: 404 });
  }

  try {
    const order = await getItem(TABLES.ORDERS, { id });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to fetch order', error);
    return NextResponse.json({ error: 'Unable to load order' }, { status: 500 });
  }
}
