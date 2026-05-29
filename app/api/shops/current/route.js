import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { SHOP_CONFIG } from '@/lib/shop-config';

export const dynamic = 'force-dynamic';

function mapShop(row, fallbackSlug) {
  if (!row) {
    return { ...SHOP_CONFIG, slug: fallbackSlug || 'default' };
  }

  return {
    ...SHOP_CONFIG,
    slug: row.slug || fallbackSlug || 'default',
    name: row.name || SHOP_CONFIG.name,
    shortName: row.short_name || SHOP_CONFIG.shortName,
    tagline: row.tagline || SHOP_CONFIG.tagline,
    description: row.description || SHOP_CONFIG.description,
    supportPhoneDisplay: row.support_phone_display || SHOP_CONFIG.supportPhoneDisplay,
    supportPhoneDial: row.support_phone_dial || SHOP_CONFIG.supportPhoneDial,
    supportEmail: row.support_email || SHOP_CONFIG.supportEmail,
    instagramHandle: row.instagram_handle || SHOP_CONFIG.instagramHandle,
    instagramUrl: row.instagram_url || SHOP_CONFIG.instagramUrl,
    whatsappNumber: row.whatsapp_number || SHOP_CONFIG.whatsappNumber,
    locationSummary: row.location_summary || SHOP_CONFIG.locationSummary,
    serviceAreas: row.service_areas || SHOP_CONFIG.serviceAreas,
    orderTerms: row.order_terms || SHOP_CONFIG.orderTerms,
    estimatedReadyTime: row.estimated_ready_time || SHOP_CONFIG.estimatedReadyTime,
    currencySymbol: row.currency_symbol || SHOP_CONFIG.currencySymbol,
    primaryColor: row.primary_color || SHOP_CONFIG.primaryColor,
    accentColor: row.accent_color || SHOP_CONFIG.accentColor,
    goldColor: row.gold_color || SHOP_CONFIG.goldColor,
    creamColor: row.cream_color || SHOP_CONFIG.creamColor,
    charcoalColor: row.charcoal_color || SHOP_CONFIG.charcoalColor,
    logoUrl: row.logo_url || SHOP_CONFIG.logoUrl,
    heroImageUrl: row.hero_image_url || SHOP_CONFIG.heroImageUrl,
    defaultMenuCategories: Array.isArray(row.default_menu_categories) && row.default_menu_categories.length
      ? row.default_menu_categories
      : SHOP_CONFIG.defaultMenuCategories,
    fontChoice: row.font_choice || 'jakarta',
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shopSlug = searchParams.get('shop') || 'default';

  if (!sql) {
    return NextResponse.json({ shop: mapShop(null, shopSlug) });
  }

  try {
    const [row] = await sql`
      SELECT *
      FROM shops
      WHERE slug = ${shopSlug}
      LIMIT 1
    `;

    return NextResponse.json({ shop: mapShop(row, shopSlug) });
  } catch (error) {
    console.error('Failed to load shop profile', error);
    return NextResponse.json({ shop: mapShop(null, shopSlug) });
  }
}
