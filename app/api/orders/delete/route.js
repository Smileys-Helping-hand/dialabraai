import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { demoStore } from '@/lib/demo-store';

export async function POST(request) {
  const body = await request.json();
  const { id } = body || {};

  if (!id) {
    return NextResponse.json({ error: 'Order id is required.' }, { status: 400 });
  }

  // Handle demo orders
  if (id.startsWith('demo-')) {
    const deleted = demoStore.deleteOrder(id);
    if (deleted) {
      console.log('📦 Demo order deleted:', id);
      return NextResponse.json({ success: true });
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
    await adminDb.collection('orders').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
