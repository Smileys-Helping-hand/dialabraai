// Order pack management utilities
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// Save an order pack for a user
export const saveOrderPack = async (userId, packName, items) => {
  if (!db || !userId) throw new Error('User must be logged in to save order packs');

  const packRef = doc(collection(db, 'users', userId, 'orderPacks'));
  await setDoc(packRef, {
    name: packName,
    items: items,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return packRef.id;
};

// Get all order packs for a user
export const getOrderPacks = async (userId) => {
  if (!db || !userId) return [];

  const packsRef = collection(db, 'users', userId, 'orderPacks');
  const snapshot = await getDocs(packsRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Delete an order pack
export const deleteOrderPack = async (userId, packId) => {
  if (!db || !userId) throw new Error('User must be logged in');

  await deleteDoc(doc(db, 'users', userId, 'orderPacks', packId));
};

// Get order history for a user
export const getOrderHistory = async (userId) => {
  if (!db || !userId) return [];

  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Local storage fallback for order packs (when not logged in)
const LOCAL_PACKS_KEY = 'dialabraai_order_packs';

export const saveOrderPackLocal = (packName, items) => {
  if (typeof window === 'undefined') return;

  try {
    const packs = JSON.parse(localStorage.getItem(LOCAL_PACKS_KEY) || '[]');
    packs.push({
      id: Date.now().toString(),
      name: packName,
      items: items,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_PACKS_KEY, JSON.stringify(packs));
  } catch (error) {
    console.warn('Failed to save order pack locally', error);
  }
};

export const getOrderPacksLocal = () => {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem(LOCAL_PACKS_KEY) || '[]');
  } catch (error) {
    console.warn('Failed to load local order packs', error);
    return [];
  }
};

export const deleteOrderPackLocal = (packId) => {
  if (typeof window === 'undefined') return;

  try {
    const packs = JSON.parse(localStorage.getItem(LOCAL_PACKS_KEY) || '[]');
    const filtered = packs.filter((pack) => pack.id !== packId);
    localStorage.setItem(LOCAL_PACKS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to delete local order pack', error);
  }
};
