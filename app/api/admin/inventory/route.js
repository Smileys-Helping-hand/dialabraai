import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { demoStore } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  // If Firebase is not configured, return demo inventory
  if (!adminDb) {
    console.log('📦 Demo mode: returning demo inventory');
    return NextResponse.json(demoStore.getAllInventory());
  }

  try {
    const snapshot = await adminDb.collection('inventory').get();
    const inventory = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Failed to fetch inventory', error);
    // If Firestore has configuration issues, return demo inventory
    if (error.code === 5 || error.code === 7 || error.reason === 'SERVICE_DISABLED') {
      console.log('⚠️  Firestore not available - returning demo inventory');
      return NextResponse.json(demoStore.getAllInventory());
    }
    return NextResponse.json({ error: 'Unable to load inventory' }, { status: 500 });
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

  if (!adminDb) {
    return NextResponse.json(
      { error: 'Firebase is not configured' },
      { status: 500 }
    );
  }

  try {
    await adminDb.collection('inventory').doc(id).update({ stock });
    const doc = await adminDb.collection('inventory').doc(id).get();
    const inventory = { id: doc.id, ...doc.data() };
    return NextResponse.json({ inventory });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
