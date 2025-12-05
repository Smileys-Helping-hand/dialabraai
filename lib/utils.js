export const formatPrice = (value) => `R${Number(value).toFixed(2)}`;

export const menuCategories = ['Seafood', 'Meat', 'Chicken', 'Sides', 'Combos'];

export const loadCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem('dialabraai_cart');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Unable to read cart from storage', error);
    return [];
  }
};

export const saveCart = (cart) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('dialabraai_cart', JSON.stringify(cart));
  } catch (error) {
    console.warn('Unable to persist cart to storage', error);
  }
};

export const clearCart = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('dialabraai_cart');
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
