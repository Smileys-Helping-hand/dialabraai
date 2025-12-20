import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp;
let adminDb;
let adminAuth;

try {
  // Initialize Firebase Admin (server-side only)
  if (getApps().length === 0) {
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
      
      // Handle different private key formats
      // 1. Check if the key is base64 encoded (for AWS Amplify compatibility)
      if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        try {
          privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
        } catch (e) {
          console.error('Failed to decode base64 private key:', e.message);
        }
      }
      
      // 2. Remove surrounding quotes if present (common Vercel issue)
      privateKey = privateKey.replace(/^["']|["']$/g, '');
      
      // 3. Replace literal \n with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // 4. Ensure proper format
      if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
        console.error('⚠️  FIREBASE_PRIVATE_KEY is malformed - missing BEGIN header');
        throw new Error('Invalid FIREBASE_PRIVATE_KEY format');
      }
      
      console.log('✅ Firebase Admin SDK initializing...');
      console.log('   Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
      console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
      console.log('   Private Key Length:', privateKey.length);
      
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
      const missing = [];
      if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
      if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
      if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      
      console.warn(
        '⚠️  Firebase Admin is not configured. Missing environment variables:',
        missing.join(', ')
      );
      console.warn('   The app will fall back to demo mode or sample data.');
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
