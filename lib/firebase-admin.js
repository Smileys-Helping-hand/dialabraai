import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp;
let adminDb;
let adminAuth;

try {
  // Initialize Firebase Admin (server-side only)
  if (getApps().length === 0) {
    console.log('Initializing Firebase Admin...', {
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length
    });
    
    // Check if using service account JSON or individual env vars
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Option 1: Full service account JSON as string
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else if (
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ) {
      // Option 2: Individual service account fields
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Check if the key is base64 encoded (for AWS Amplify compatibility)
      if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        try {
          privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
        } catch (e) {
          console.error('Failed to decode base64 private key:', e.message);
        }
      }
      
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      console.warn(
        'Firebase Admin is not configured. Provide FIREBASE_SERVICE_ACCOUNT_KEY or individual credentials.'
      );
    }
  } else {
    adminApp = getApps()[0];
  }

  if (adminApp) {
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error.message);
}

export { adminDb, adminAuth };
export default adminApp;
