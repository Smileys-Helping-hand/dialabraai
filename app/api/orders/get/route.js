import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
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

  // If Firebase is configured, use it
  if (!adminDb) {
    return NextResponse.json({ error: 'Firebase not configured and order not found' }, { status: 404 });
  }

  try {
    const doc = await adminDb.collection('orders').doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Failed to fetch order', error);
    return NextResponse.json({ error: 'Unable to load order' }, { status: 500 });
  }
}
