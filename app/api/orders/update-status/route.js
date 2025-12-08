import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
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

  if (!adminDb) {
    return NextResponse.json(
      { error: 'Firebase is not configured and order is not a demo order.' },
      { status: 500 }
    );
  }

  try {
    await adminDb.collection('orders').doc(id).update({ status });
    const doc = await adminDb.collection('orders').doc(id).get();
    const order = { id: doc.id, ...doc.data() };
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
