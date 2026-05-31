import { NextResponse } from 'next/server';
import { sql, getTimestamp } from '@/lib/db';
import { SHOP_CONFIG } from '@/lib/shop-config';
import { dispatchWebhook } from '@/lib/webhook-dispatcher';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

const toList = (value, fallback) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((entry) => entry.trim()).filter(Boolean);
  }
  return fallback;
};

async function runMigrations() {
  if (!sql) return;
  const cols = [
    sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS font_choice TEXT DEFAULT 'jakarta'`,
    sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE`,
    sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`,
    sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT TRUE`,
    sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS operating_hours TEXT DEFAULT ''`,
    sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS payment_methods TEXT DEFAULT ''`,
    sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_slug TEXT`,
    sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS shop_slug TEXT`,
    sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_special BOOLEAN DEFAULT FALSE`,
    sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS dietary_tags TEXT DEFAULT ''`,
  ];
  for (const q of cols) {
    try { await q; } catch { /* column may already exist */ }
  }
}

export async function POST(request) {
  await runMigrations();
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
    font_choice:       String(shop.fontChoice       || 'jakarta').trim(),
    is_open:           shop.isOpen !== undefined ? Boolean(shop.isOpen) : true,
    operating_hours:   String(shop.operatingHours  || '').trim(),
    payment_methods:   String(shop.paymentMethods  || '').trim(),
    utm_source:        String(shop.utmSource || '').trim(),
    utm_medium:        String(shop.utmMedium || '').trim(),
    utm_campaign:      String(shop.utmCampaign || '').trim(),
    utm_content:       String(shop.utmContent || '').trim(),
    campaign_id:       String(shop.campaignId || '').trim(),
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
    const isNewShop = await sql`SELECT slug FROM shops WHERE slug = ${record.slug} LIMIT 1`.then(r => r.length === 0);

    await sql`
      INSERT INTO shops (
        slug, name, short_name, tagline, description, support_phone_display, support_phone_dial,
        support_email, instagram_handle, instagram_url, whatsapp_number, location_summary,
        service_areas, order_terms, estimated_ready_time, currency_symbol, default_menu_categories,
        primary_color, accent_color, gold_color, cream_color, charcoal_color,
        logo_url, hero_image_url, font_choice,
        is_open, operating_hours, payment_methods, utm_source, utm_medium, utm_campaign, utm_content, campaign_id,
        created_at, updated_at
      ) VALUES (
        ${record.slug}, ${record.name}, ${record.short_name}, ${record.tagline}, ${record.description},
        ${record.support_phone_display}, ${record.support_phone_dial}, ${record.support_email},
        ${record.instagram_handle}, ${record.instagram_url}, ${record.whatsapp_number},
        ${record.location_summary}, ${record.service_areas}, ${record.order_terms},
        ${record.estimated_ready_time}, ${record.currency_symbol}, ${record.default_menu_categories}::jsonb,
        ${record.primary_color}, ${record.accent_color}, ${record.gold_color}, ${record.cream_color}, ${record.charcoal_color},
        ${record.logo_url}, ${record.hero_image_url}, ${record.font_choice},
        ${record.is_open}, ${record.operating_hours}, ${record.payment_methods}, ${record.utm_source}, ${record.utm_medium}, ${record.utm_campaign}, ${record.utm_content}, ${record.campaign_id},
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
        is_open = EXCLUDED.is_open,
        operating_hours = EXCLUDED.operating_hours,
        payment_methods = EXCLUDED.payment_methods,
        utm_source = EXCLUDED.utm_source,
        utm_medium = EXCLUDED.utm_medium,
        utm_campaign = EXCLUDED.utm_campaign,
        utm_content = EXCLUDED.utm_content,
        campaign_id = EXCLUDED.campaign_id,
        updated_at = EXCLUDED.updated_at
    `;

    // If this is a new shop with UTM attribution, record the conversion event
    if (isNewShop && record.campaign_id) {
      await sql`
        INSERT INTO ad_events (id, campaign_id, event_type, shop_slug, path)
        VALUES (
          ${`evt_${Date.now()}_${randomBytes(4).toString('hex')}`},
          ${record.campaign_id},
          'conversion',
          ${record.slug},
          '/join'
        )
      `;
    }

    // Fire-and-forget: dispatch shop_created webhook to the main app
    dispatchWebhook('shop_created', {
      slug: record.slug,
      name: record.name,
      email: record.support_email,
      createdAt: record.created_at,
    }, 'app_dialabraai');

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
