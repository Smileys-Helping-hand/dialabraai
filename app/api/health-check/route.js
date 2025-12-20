import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    firebase: {
      configured: false,
      adminDbAvailable: false,
      adminAuthAvailable: false,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET',
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'NOT SET',
    },
    tests: {
      canReadFirestore: false,
      error: null,
    },
  };

  // Check if Firebase Admin is initialized
  status.firebase.configured = !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
  
  status.firebase.adminDbAvailable = !!adminDb;
  status.firebase.adminAuthAvailable = !!adminAuth;

  // Test Firestore read
  if (adminDb) {
    try {
      // Try to read from menu collection
      const testSnapshot = await adminDb.collection('menu').limit(1).get();
      status.tests.canReadFirestore = true;
      status.tests.documentCount = testSnapshot.size;
    } catch (error) {
      status.tests.canReadFirestore = false;
      status.tests.error = {
        message: error.message,
        code: error.code,
        details: error.details || null,
      };
    }
  }

  const httpStatus = status.tests.canReadFirestore ? 200 : 500;

  return NextResponse.json(status, { 
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
