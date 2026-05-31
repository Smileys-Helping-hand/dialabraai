const env = typeof process !== 'undefined' ? process.env : {};

export const SHOP_CONFIG = {
  name: env.NEXT_PUBLIC_SHOP_NAME || 'Shopfront',
  shortName: env.NEXT_PUBLIC_SHOP_SHORT_NAME || 'SF',
  tagline: env.NEXT_PUBLIC_SHOP_TAGLINE || 'Simple online ordering for local shops',
  description: env.NEXT_PUBLIC_SHOP_DESCRIPTION || 'Help customers order faster while you track sales in one place.',
  supportPhoneDisplay: env.NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY || '081 749 2724',
  supportPhoneDial: env.NEXT_PUBLIC_SUPPORT_PHONE_DIAL || '0817492724',
  supportEmail: env.NEXT_PUBLIC_SUPPORT_EMAIL || 'hello@shopfront.local',
  instagramHandle: env.NEXT_PUBLIC_INSTAGRAM_HANDLE || '@shopfront',
  instagramUrl: env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/shopfront',
  whatsappNumber: env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27837864913',
  locationSummary: env.NEXT_PUBLIC_LOCATION_SUMMARY || 'Built for local stores and takeaways',
  serviceAreas: env.NEXT_PUBLIC_SERVICE_AREAS || 'In-store pickup and local delivery',
  orderTerms: env.NEXT_PUBLIC_ORDER_TERMS || 'Pay on collection or delivery, unless your shop enables online payment.',
  estimatedReadyTime: env.NEXT_PUBLIC_ESTIMATED_READY_TIME || '30-45 minutes',
  currencySymbol: env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'R',
  primaryColor: env.NEXT_PUBLIC_PRIMARY_COLOR || '#762C1B',
  accentColor: env.NEXT_PUBLIC_ACCENT_COLOR || '#E46A28',
  goldColor: env.NEXT_PUBLIC_GOLD_COLOR || '#F4C056',
  creamColor: env.NEXT_PUBLIC_CREAM_COLOR || '#FFF4E2',
  charcoalColor: env.NEXT_PUBLIC_CHARCOAL_COLOR || '#1A1715',
  logoUrl: env.NEXT_PUBLIC_LOGO_URL || '',
  heroImageUrl: env.NEXT_PUBLIC_HERO_IMAGE_URL || '',
  fontChoice:      env.NEXT_PUBLIC_FONT_CHOICE || 'jakarta',
  isOpen:          true,
  operatingHours:  env.NEXT_PUBLIC_OPERATING_HOURS || '',
  paymentMethods:  env.NEXT_PUBLIC_PAYMENT_METHODS || '',
  defaultMenuCategories: (env.NEXT_PUBLIC_DEFAULT_MENU_CATEGORIES || 'Featured,Meals,Drinks,Desserts,Bundles')
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean),
};

export const STORAGE_KEYS = {
  CART: 'shopfront_cart',
  CUSTOMER: 'shopfront_customer',
  ORDER_PACKS: 'shopfront_order_packs',
  GUEST_MODE: 'shopfront_guest_mode',
  SITE_AUTH: 'shopfront_site_authenticated',
};

export const LEGACY_STORAGE_KEYS = {
  CART: 'dialabraai_cart',
  CUSTOMER: 'dialabraai_customer',
  ORDER_PACKS: 'dialabraai_order_packs',
  GUEST_MODE: 'dialabraai_guest_mode',
  SITE_AUTH: 'site_authenticated',
};

export function normalizeWhatsappNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

export function buildNoreplyEmail() {
  const supportEmail = String(SHOP_CONFIG.supportEmail || 'hello@shopfront.local');
  const domain = supportEmail.includes('@') ? supportEmail.split('@')[1] : 'shopfront.local';
  return `noreply@${domain}`;
}

export function isHexColor(value) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value || '').trim());
}

export function buildWhatsappOrderLink(orderId, shop = SHOP_CONFIG) {
  const whatsappNumber = normalizeWhatsappNumber(shop.whatsappNumber);
  const orderRef = orderId ? `order ${orderId}` : 'an order';
  const message = `Hi ${shop.name}, I just placed ${orderRef} and I would like to confirm the details.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
