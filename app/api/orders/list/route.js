import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { demoStore } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  // If Firebase is not configured, return demo orders
  if (!adminDb) {
    console.log('📦 Demo mode: returning demo orders list');
    return NextResponse.json(demoStore.getAllOrders());
  }

  try {
    const snapshot = await adminDb.collection('orders').orderBy('created_at', 'desc').get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders', error);
    // If Firestore has any configuration issues, return demo orders
    // Error codes: 5 = NOT_FOUND (no database), 7 = SERVICE_DISABLED, etc.
    if (error.code === 5 || error.code === 7 || error.reason === 'SERVICE_DISABLED') {
      console.log('⚠️  Firestore not available - returning demo orders');
      return NextResponse.json(demoStore.getAllOrders());
    }
    return NextResponse.json({ error: 'Unable to load orders' }, { status: 500 });
  }
}
