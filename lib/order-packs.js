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
import { STORAGE_KEYS, LEGACY_STORAGE_KEYS } from './shop-config';

const DEFAULT_SCOPE = 'default';

const scopedKey = (scopeSlug = DEFAULT_SCOPE) => (scopeSlug && scopeSlug !== DEFAULT_SCOPE ? `${STORAGE_KEYS.ORDER_PACKS}:${scopeSlug}` : STORAGE_KEYS.ORDER_PACKS);

// Save an order pack for a user
export const saveOrderPack = async (userId, packName, items, shopSlug = DEFAULT_SCOPE) => {
  if (!db || !userId) throw new Error('User must be logged in to save order packs');

  const packRef = doc(collection(db, 'users', userId, 'orderPacks'));
  await setDoc(packRef, {
    name: packName,
    items: items,
    shopSlug,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return packRef.id;
};

// Get all order packs for a user
export const getOrderPacks = async (userId, shopSlug = DEFAULT_SCOPE) => {
  if (!db || !userId) return [];

  const packsRef = collection(db, 'users', userId, 'orderPacks');
  const snapshot = await getDocs(packsRef);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((pack) => String(pack.shopSlug || DEFAULT_SCOPE) === String(shopSlug || DEFAULT_SCOPE));
};

// Delete an order pack
export const deleteOrderPack = async (userId, packId) => {
  if (!db || !userId) throw new Error('User must be logged in');

  await deleteDoc(doc(db, 'users', userId, 'orderPacks', packId));
};

// Get order history for a user — queries Neon DB via API
export const getOrderHistory = async (userId, shopSlug = DEFAULT_SCOPE) => {
  if (!userId) return [];

  try {
    const res = await fetch(`/api/orders/user?userId=${encodeURIComponent(userId)}&shop=${encodeURIComponent(shopSlug || DEFAULT_SCOPE)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn('Failed to fetch order history from API', error);
    return [];
  }
};

// Local storage fallback for order packs (when not logged in)
const LOCAL_PACKS_KEY = STORAGE_KEYS.ORDER_PACKS;

export const saveOrderPackLocal = (packName, items, scopeSlug = DEFAULT_SCOPE) => {
  if (typeof window === 'undefined') return;

  try {
    const currentKey = scopedKey(scopeSlug);
    const packs = JSON.parse(
      localStorage.getItem(currentKey)
      || (scopeSlug === DEFAULT_SCOPE ? localStorage.getItem(LEGACY_STORAGE_KEYS.ORDER_PACKS) : null)
      || '[]'
    );
    packs.push({
      id: Date.now().toString(),
      name: packName,
      items: items,
      shopSlug: scopeSlug,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(currentKey, JSON.stringify(packs));
  } catch (error) {
    console.warn('Failed to save order pack locally', error);
  }
};

export const getOrderPacksLocal = (scopeSlug = DEFAULT_SCOPE) => {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(
      localStorage.getItem(scopedKey(scopeSlug))
      || (scopeSlug === DEFAULT_SCOPE ? localStorage.getItem(LEGACY_STORAGE_KEYS.ORDER_PACKS) : null)
      || '[]'
    );
  } catch (error) {
    console.warn('Failed to load local order packs', error);
    return [];
  }
};

export const deleteOrderPackLocal = (packId, scopeSlug = DEFAULT_SCOPE) => {
  if (typeof window === 'undefined') return;

  try {
    const packs = JSON.parse(
      localStorage.getItem(scopedKey(scopeSlug))
      || (scopeSlug === DEFAULT_SCOPE ? localStorage.getItem(LEGACY_STORAGE_KEYS.ORDER_PACKS) : null)
      || '[]'
    );
    const filtered = packs.filter((pack) => pack.id !== packId);
    localStorage.setItem(scopedKey(scopeSlug), JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to delete local order pack', error);
  }
};
