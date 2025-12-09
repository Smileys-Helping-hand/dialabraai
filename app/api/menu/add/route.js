import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { menuCategories } from '@/lib/utils';

export async function POST(request) {
  if (!adminDb) {
    console.error('Firebase Admin not configured. Environment check:', {
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
      privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30)
    });
    return NextResponse.json(
      { error: 'Firebase is not configured. Add Firebase credentials.' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { name, description = '', price, category, image_url = '' } = body || {};

  if (!name || typeof price === 'undefined' || !category) {
    return NextResponse.json({ error: 'Name, price, and category are required.' }, { status: 400 });
  }

  if (!menuCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category provided.' }, { status: 400 });
  }

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    return NextResponse.json({ error: 'Price must be a positive number.' }, { status: 400 });
  }

  try {
    const docRef = await adminDb.collection('menu').add({
      name,
      description,
      price: numericPrice,
      category,
      image_url,
      created_at: new Date().toISOString(),
    });

    const doc = await docRef.get();
    const item = { id: doc.id, ...doc.data() };

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
