import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
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

  if (!adminDb) {
    return NextResponse.json(
      { error: 'Firebase is not configured and order is not a demo order.' },
      { status: 500 }
    );
  }

  try {
    await adminDb.collection('orders').doc(id).update({ paid });
    const doc = await adminDb.collection('orders').doc(id).get();
    const order = { id: doc.id, ...doc.data() };
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
