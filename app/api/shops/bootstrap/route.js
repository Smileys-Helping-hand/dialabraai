import { NextResponse } from 'next/server';
import { sql, getTimestamp } from '@/lib/db';
import { SHOP_CONFIG } from '@/lib/shop-config';

export const dynamic = 'force-dynamic';

const toList = (value, fallback) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((entry) => entry.trim()).filter(Boolean);
  }
  return fallback;
};

export async function POST(request) {
  const body = await request.json();
  const shop = body || {};
  const slug = String(shop.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  if (!slug) {
    return NextResponse.json({ error: 'A valid shop slug is required.' }, { status: 400 });
  }

  const record = {
    slug,
    name: String(shop.name || SHOP_CONFIG.name).trim(),
    short_name: String(shop.shortName || SHOP_CONFIG.shortName).trim(),
    tagline: String(shop.tagline || SHOP_CONFIG.tagline).trim(),
    description: String(shop.description || SHOP_CONFIG.description).trim(),
    support_phone_display: String(shop.supportPhoneDisplay || SHOP_CONFIG.supportPhoneDisplay).trim(),
    support_phone_dial: String(shop.supportPhoneDial || SHOP_CONFIG.supportPhoneDial).trim(),
    support_email: String(shop.supportEmail || SHOP_CONFIG.supportEmail).trim(),
    instagram_handle: String(shop.instagramHandle || SHOP_CONFIG.instagramHandle).trim(),
    instagram_url: String(shop.instagramUrl || SHOP_CONFIG.instagramUrl).trim(),
    whatsapp_number: String(shop.whatsappNumber || SHOP_CONFIG.whatsappNumber).trim(),
    location_summary: String(shop.locationSummary || SHOP_CONFIG.locationSummary).trim(),
    service_areas: String(shop.serviceAreas || SHOP_CONFIG.serviceAreas).trim(),
    order_terms: String(shop.orderTerms || SHOP_CONFIG.orderTerms).trim(),
    estimated_ready_time: String(shop.estimatedReadyTime || SHOP_CONFIG.estimatedReadyTime).trim(),
    currency_symbol: String(shop.currencySymbol || SHOP_CONFIG.currencySymbol).trim(),
    primary_color: String(shop.primaryColor || SHOP_CONFIG.primaryColor).trim(),
    accent_color: String(shop.accentColor || SHOP_CONFIG.accentColor).trim(),
    gold_color: String(shop.goldColor || SHOP_CONFIG.goldColor).trim(),
    cream_color: String(shop.creamColor || SHOP_CONFIG.creamColor).trim(),
    charcoal_color: String(shop.charcoalColor || SHOP_CONFIG.charcoalColor).trim(),
    logo_url: String(shop.logoUrl || SHOP_CONFIG.logoUrl || '').trim(),
    hero_image_url: String(shop.heroImageUrl || SHOP_CONFIG.heroImageUrl || '').trim(),
    default_menu_categories: JSON.stringify(toList(shop.defaultMenuCategories, SHOP_CONFIG.defaultMenuCategories)),
    font_choice: String(shop.fontChoice || 'jakarta').trim(),
    created_at: getTimestamp(),
    updated_at: getTimestamp(),
  };

  if (!sql) {
    return NextResponse.json({
      shop: {
        ...SHOP_CONFIG,
        ...shop,
        slug,
        defaultMenuCategories: toList(shop.defaultMenuCategories, SHOP_CONFIG.defaultMenuCategories),
      },
      publicUrl: `/home?shop=${encodeURIComponent(slug)}`,
      adminUrl: `/admin/setup?shop=${encodeURIComponent(slug)}`,
      demo: true,
    });
  }

  try {
    await sql`
      INSERT INTO shops (
        slug, name, short_name, tagline, description, support_phone_display, support_phone_dial,
        support_email, instagram_handle, instagram_url, whatsapp_number, location_summary,
        service_areas, order_terms, estimated_ready_time, currency_symbol, default_menu_categories,
        primary_color, accent_color, gold_color, cream_color, charcoal_color,
        logo_url, hero_image_url, font_choice,
        created_at, updated_at
      ) VALUES (
        ${record.slug}, ${record.name}, ${record.short_name}, ${record.tagline}, ${record.description},
        ${record.support_phone_display}, ${record.support_phone_dial}, ${record.support_email},
        ${record.instagram_handle}, ${record.instagram_url}, ${record.whatsapp_number},
        ${record.location_summary}, ${record.service_areas}, ${record.order_terms},
        ${record.estimated_ready_time}, ${record.currency_symbol}, ${record.default_menu_categories}::jsonb,
        ${record.primary_color}, ${record.accent_color}, ${record.gold_color}, ${record.cream_color}, ${record.charcoal_color},
        ${record.logo_url}, ${record.hero_image_url}, ${record.font_choice},
        ${record.created_at}, ${record.updated_at}
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        short_name = EXCLUDED.short_name,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        support_phone_display = EXCLUDED.support_phone_display,
        support_phone_dial = EXCLUDED.support_phone_dial,
        support_email = EXCLUDED.support_email,
        instagram_handle = EXCLUDED.instagram_handle,
        instagram_url = EXCLUDED.instagram_url,
        whatsapp_number = EXCLUDED.whatsapp_number,
        location_summary = EXCLUDED.location_summary,
        service_areas = EXCLUDED.service_areas,
        order_terms = EXCLUDED.order_terms,
        estimated_ready_time = EXCLUDED.estimated_ready_time,
        currency_symbol = EXCLUDED.currency_symbol,
        default_menu_categories = EXCLUDED.default_menu_categories,
        primary_color = EXCLUDED.primary_color,
        accent_color = EXCLUDED.accent_color,
        gold_color = EXCLUDED.gold_color,
        cream_color = EXCLUDED.cream_color,
        charcoal_color = EXCLUDED.charcoal_color,
        logo_url = EXCLUDED.logo_url,
        hero_image_url = EXCLUDED.hero_image_url,
        font_choice = EXCLUDED.font_choice,
        updated_at = EXCLUDED.updated_at
    `;

    return NextResponse.json({
      shop: {
        ...SHOP_CONFIG,
        ...shop,
        slug,
        logoUrl: String(shop.logoUrl || SHOP_CONFIG.logoUrl || '').trim(),
        heroImageUrl: String(shop.heroImageUrl || SHOP_CONFIG.heroImageUrl || '').trim(),
        defaultMenuCategories: toList(shop.defaultMenuCategories, SHOP_CONFIG.defaultMenuCategories),
      },
      publicUrl: `/home?shop=${encodeURIComponent(slug)}`,
      adminUrl: `/admin/setup?shop=${encodeURIComponent(slug)}`,
    });
  } catch (error) {
    console.error('Failed to bootstrap shop', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
