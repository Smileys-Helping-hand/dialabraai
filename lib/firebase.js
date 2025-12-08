import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000',
};

// Check if Firebase is properly configured
const isConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                     process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Initialize Firebase (only once and only if configured or in browser)
let app = null;
let auth = null;
let db = null;

if (typeof window !== 'undefined' || isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Set persistence for admin sessions (browser only)
    if (typeof window !== 'undefined' && auth) {
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn('Failed to set auth persistence:', error);
      });
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error.message);
  }
}

export { auth, db };

// Admin session helpers
const ADMIN_SESSION_KEY = 'dab-admin-session';

export const persistAdminSession = (user) => {
  if (!user || typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({
      uid: user.uid,
      email: user.email,
      accessToken: user.accessToken,
    });
    window.localStorage.setItem(ADMIN_SESSION_KEY, payload);
  } catch (err) {
    console.warn('Failed to persist admin session', err);
  }
};

export const getStoredAdminSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Unable to parse stored admin session', err);
    return null;
  }
};

export const clearAdminSession = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (err) {
    console.warn('Failed to clear admin session', err);
  }
};

export default app;
