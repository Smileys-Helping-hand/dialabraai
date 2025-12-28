import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { demoStore } from '@/lib/demo-store';

export async function POST(request) {
  const body = await request.json();
  const { items, customer_name, customer_phone, customer_email, notes, total_price, userId } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  if (!customer_name || !customer_phone) {
    return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
  }

  const payload = {
    items,
    total_price: Number(total_price) || 0,
    customer_name,
    customer_phone,
    customer_email: customer_email || '',
    notes: notes || '',
    status: 'pending',
    paid: false,
    created_at: new Date().toISOString(),
    userId: userId || null, // Link to user account if provided
  };

  // If Firebase is configured, use it
  if (adminDb) {
    try {
      const docRef = await adminDb.collection('orders').add(payload);
      return NextResponse.json({ id: docRef.id }, { status: 200 });
    } catch (error) {
      console.error('Firebase order insert failed', error);
      // If Firestore has configuration issues, fall back to demo mode
      // Error codes: 5 = NOT_FOUND (no database), 7 = SERVICE_DISABLED, etc.
      if (error.code === 5 || error.code === 7 || error.reason === 'SERVICE_DISABLED') {
        console.log('⚠️  Firestore not available - creating demo order');
        const orderId = demoStore.createOrder(payload);
        return NextResponse.json({ id: orderId }, { status: 200 });
      }
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
  }

  // Fallback: use demo mode (in-memory storage)
  const orderId = demoStore.createOrder(payload);
  return NextResponse.json({ id: orderId }, { status: 200 });
}
