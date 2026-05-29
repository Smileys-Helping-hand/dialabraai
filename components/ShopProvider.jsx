'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SHOP_CONFIG, isHexColor } from '@/lib/shop-config';

export const SHOP_FONTS = {
  jakarta:  { label: 'Modern',    cssVar: 'var(--font-jakarta)',  sample: 'Plus Jakarta Sans' },
  syne:     { label: 'Bold',      cssVar: 'var(--font-syne)',     sample: 'Syne' },
  playfair: { label: 'Elegant',   cssVar: 'var(--font-playfair)', sample: 'Playfair Display' },
  nunito:   { label: 'Friendly',  cssVar: 'var(--font-nunito)',   sample: 'Nunito' },
  space:    { label: 'Sharp',     cssVar: 'var(--font-space)',    sample: 'Space Grotesk' },
  oswald:   { label: 'Bold Slab', cssVar: 'var(--font-oswald)',   sample: 'Oswald' },
};

const ShopContext = createContext({
  shop: SHOP_CONFIG,
  shopSlug: 'default',
  loading: false,
  refreshShop: async () => {},
});

export function useShop() {
  return useContext(ShopContext);
}

function slugFromPath(pathname) {
  // Matches /shop/SLUG or /shop/SLUG/anything
  const m = pathname?.match(/^\/shop\/([^/?#]+)/);
  return m?.[1] || null;
}

function hexToRgbTriplet(value, fallback = '762C1B') {
  const hex = isHexColor(value) ? value.substring(1) : fallback;
  const normalized = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const int = parseInt(normalized, 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

export default function ShopProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Slug priority: /shop/[slug] path → ?shop= param → 'default'
  const shopSlug = slugFromPath(pathname) || searchParams?.get('shop') || 'default';

  const [shop, setShop] = useState(SHOP_CONFIG);
  const [loading, setLoading] = useState(true);

  const refreshShop = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shops/current?shop=${encodeURIComponent(shopSlug)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setShop({ ...SHOP_CONFIG, ...(data?.shop || {}) });
      } else {
        setShop(SHOP_CONFIG);
      }
    } catch {
      setShop(SHOP_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (s) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Colours
    root.style.setProperty('--color-primary', hexToRgbTriplet(s.primaryColor,  SHOP_CONFIG.primaryColor.substring(1)));
    root.style.setProperty('--color-flame',   hexToRgbTriplet(s.accentColor,   SHOP_CONFIG.accentColor.substring(1)));
    root.style.setProperty('--color-gold',    hexToRgbTriplet(s.goldColor,     SHOP_CONFIG.goldColor.substring(1)));
    root.style.setProperty('--color-cream',   hexToRgbTriplet(s.creamColor,    SHOP_CONFIG.creamColor.substring(1)));
    root.style.setProperty('--color-charcoal',hexToRgbTriplet(s.charcoalColor, SHOP_CONFIG.charcoalColor.substring(1)));

    // Font — only override when on a shop page, not the marketplace
    const fontKey = s.fontChoice && SHOP_FONTS[s.fontChoice] ? s.fontChoice : 'jakarta';
    root.style.setProperty('--font-shop-display', SHOP_FONTS[fontKey].cssVar);
  };

  useEffect(() => { refreshShop(); }, [shopSlug]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { applyTheme(shop); }, [shop]);    // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => ({ shop, shopSlug, loading, refreshShop }), [shop, shopSlug, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
