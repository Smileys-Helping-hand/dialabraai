import { NextResponse } from 'next/server';
import { docClient, TABLES, scanTable } from '@/lib/dynamodb';
import { demoStore } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  // If DynamoDB is not configured, return demo orders
  if (!docClient) {
    console.log('📦 Demo mode: returning demo orders list');
    return NextResponse.json(demoStore.getAllOrders());
  }

  try {
    const orders = await scanTable(TABLES.ORDERS);
    // Sort by created_at descending
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders', error);
    // If DynamoDB has any configuration issues, return demo orders
    console.log('⚠️  DynamoDB not available - returning demo orders');
    return NextResponse.json(demoStore.getAllOrders());
  }
}
