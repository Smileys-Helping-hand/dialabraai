// User authentication context and helpers
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userDoc.data(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, name, phone) => {
    if (!auth) throw new Error('Authentication not available');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      name,
      phone,
      createdAt: serverTimestamp(),
    });

    return user;
  };

  const signIn = async (email, password) => {
    if (!auth) throw new Error('Authentication not available');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    if (!auth) return;
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Guest mode helpers
const GUEST_MODE_KEY = 'dialabraai_guest_mode';

export const isGuestMode = () => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(GUEST_MODE_KEY) !== 'false';
};

export const setGuestMode = (isGuest) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_MODE_KEY, isGuest ? 'true' : 'false');
};
