import { SHOP_CONFIG, STORAGE_KEYS, LEGACY_STORAGE_KEYS } from './shop-config';

const DEFAULT_SCOPE = 'default';

const scopedKey = (baseKey, scopeSlug = DEFAULT_SCOPE) => (scopeSlug && scopeSlug !== DEFAULT_SCOPE ? `${baseKey}:${scopeSlug}` : baseKey);

export const formatPrice = (value) => `${SHOP_CONFIG.currencySymbol}${Number(value).toFixed(2)}`;

export const defaultMenuCategories = SHOP_CONFIG.defaultMenuCategories;

export const deriveMenuCategories = (items = [], fallback = defaultMenuCategories) => {
  const unique = [];
  const seen = new Set();

  items.forEach((item) => {
    const category = String(item?.category || '').trim();
    if (category && !seen.has(category)) {
      seen.add(category);
      unique.push(category);
    }
  });

  return unique.length ? unique : fallback;
};

export const loadCart = (scopeSlug = DEFAULT_SCOPE) => {
  if (typeof window === 'undefined') return [];
  try {
    const currentKey = scopedKey(STORAGE_KEYS.CART, scopeSlug);
    const stored = window.localStorage.getItem(currentKey)
      || (scopeSlug === DEFAULT_SCOPE ? window.localStorage.getItem(LEGACY_STORAGE_KEYS.CART) : null);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Unable to read cart from storage', error);
    return [];
  }
};

export const saveCart = (cart, scopeSlug = DEFAULT_SCOPE) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(scopedKey(STORAGE_KEYS.CART, scopeSlug), JSON.stringify(cart));
  } catch (error) {
    console.warn('Unable to persist cart to storage', error);
  }
};

export const clearCart = (scopeSlug = DEFAULT_SCOPE) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(scopedKey(STORAGE_KEYS.CART, scopeSlug));
  } catch (error) {
    console.warn('Unable to clear cart from storage', error);
  }
};

export const isValidPhone = (value) => {
  if (!value) return false;
  const cleaned = value.replace(/[^\d+]/g, '');
  return cleaned.length >= 8 && cleaned.length <= 15;
};

export const isNonEmpty = (value) => Boolean(value && value.trim().length >= 2);

// Customer info persistence
export const loadCustomerInfo = (scopeSlug = DEFAULT_SCOPE) => {
  if (typeof window === 'undefined') return null;
  try {
    const currentKey = scopedKey(STORAGE_KEYS.CUSTOMER, scopeSlug);
    const stored = window.localStorage.getItem(currentKey)
      || (scopeSlug === DEFAULT_SCOPE ? window.localStorage.getItem(LEGACY_STORAGE_KEYS.CUSTOMER) : null);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Unable to read customer info from storage', error);
    return null;
  }
};

export const saveCustomerInfo = (customerInfo, scopeSlug = DEFAULT_SCOPE) => {
  if (typeof window === 'undefined') return;
  try {
    // Only save if user provided at least name and phone
    if (customerInfo.name && customerInfo.phone) {
      window.localStorage.setItem(scopedKey(STORAGE_KEYS.CUSTOMER, scopeSlug), JSON.stringify(customerInfo));
    }
  } catch (error) {
    console.warn('Unable to persist customer info to storage', error);
  }
};

export const clearCustomerInfo = (scopeSlug = DEFAULT_SCOPE) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(scopedKey(STORAGE_KEYS.CUSTOMER, scopeSlug));
  } catch (error) {
    console.warn('Unable to clear customer info from storage', error);
  }
};
