import { NextResponse } from 'next/server';
import { docClient, TABLES, scanTable, updateItem, getItem } from '@/lib/dynamodb';
import { demoStore } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  // If DynamoDB is not configured, return demo inventory
  if (!docClient) {
    console.log('📦 Demo mode: returning demo inventory');
    return NextResponse.json(demoStore.getAllInventory());
  }

  try {
    const inventory = await scanTable(TABLES.MENU);
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Failed to fetch inventory', error);
    // If DynamoDB has configuration issues, return demo inventory
    console.log('⚠️  DynamoDB not available - returning demo inventory');
    return NextResponse.json(demoStore.getAllInventory());
  }
}

export async function POST(request) {
  const body = await request.json();
  const { id, stock } = body || {};

  if (!id || stock === undefined) {
    return NextResponse.json({ error: 'Item ID and stock are required' }, { status: 400 });
  }

  // Handle demo inventory
  if (typeof id === 'number' || id.toString().startsWith('demo-')) {
    const updated = demoStore.updateStock(id, stock);
    if (updated) {
      const inventory = demoStore.getInventory(id);
      console.log('📦 Demo inventory updated:', id, stock);
      return NextResponse.json({ inventory });
    }
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  if (!docClient) {
    return NextResponse.json(
      { error: 'DynamoDB is not configured' },
      { status: 500 }
    );
  }

  try {
    await updateItem(TABLES.MENU, { id }, { stock });
    const inventory = await getItem(TABLES.MENU, { id });
    return NextResponse.json({ inventory });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
