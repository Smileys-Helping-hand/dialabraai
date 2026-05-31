import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { SHOP_CONFIG } from '@/lib/shop-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!sql) {
    return NextResponse.json([
      {
        slug: 'default',
        name: SHOP_CONFIG.name,
        shortName: SHOP_CONFIG.shortName,
        tagline: SHOP_CONFIG.tagline,
        description: SHOP_CONFIG.description,
        logoUrl: SHOP_CONFIG.logoUrl,
        heroImageUrl: SHOP_CONFIG.heroImageUrl,
        primaryColor: SHOP_CONFIG.primaryColor,
        accentColor: SHOP_CONFIG.accentColor,
        whatsappNumber: SHOP_CONFIG.whatsappNumber,
        locationSummary: SHOP_CONFIG.locationSummary,
        defaultMenuCategories: SHOP_CONFIG.defaultMenuCategories,
        estimatedReadyTime: SHOP_CONFIG.estimatedReadyTime,
        instagramHandle: SHOP_CONFIG.instagramHandle,
      },
    ]);
  }

  try {
    const rows = await sql`
      SELECT
        slug,
        name,
        short_name,
        is_open,
        operating_hours,
        tagline,
        description,
        logo_url,
        hero_image_url,
        primary_color,
        accent_color,
        whatsapp_number,
        location_summary,
        service_areas,
        default_menu_categories,
        estimated_ready_time,
        instagram_handle,
        created_at
      FROM shops
      ORDER BY COALESCE(name, slug)
    `;

    return NextResponse.json(
      rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        shortName: row.short_name,
        tagline: row.tagline,
        description: row.description,
        logoUrl: row.logo_url,
        heroImageUrl: row.hero_image_url,
        primaryColor: row.primary_color || SHOP_CONFIG.primaryColor,
        accentColor: row.accent_color || SHOP_CONFIG.accentColor,
        whatsappNumber: row.whatsapp_number,
        locationSummary: row.location_summary,
        serviceAreas: row.service_areas,
        defaultMenuCategories: Array.isArray(row.default_menu_categories) && row.default_menu_categories.length
          ? row.default_menu_categories
          : SHOP_CONFIG.defaultMenuCategories,
        estimatedReadyTime: row.estimated_ready_time,
        instagramHandle: row.instagram_handle,
        isOpen:          row.is_open !== false,
        operatingHours:  row.operating_hours || '',
        createdAt: row.created_at,
      }))
    );
  } catch (error) {
    console.error('Failed to load shop list', error);
    return NextResponse.json([
      {
        slug: 'default',
        name: SHOP_CONFIG.name,
        shortName: SHOP_CONFIG.shortName,
        tagline: SHOP_CONFIG.tagline,
        description: SHOP_CONFIG.description,
        logoUrl: SHOP_CONFIG.logoUrl,
        heroImageUrl: SHOP_CONFIG.heroImageUrl,
        primaryColor: SHOP_CONFIG.primaryColor,
        accentColor: SHOP_CONFIG.accentColor,
        whatsappNumber: SHOP_CONFIG.whatsappNumber,
        locationSummary: SHOP_CONFIG.locationSummary,
        defaultMenuCategories: SHOP_CONFIG.defaultMenuCategories,
        estimatedReadyTime: SHOP_CONFIG.estimatedReadyTime,
        instagramHandle: SHOP_CONFIG.instagramHandle,
      },
    ]);
  }
}
