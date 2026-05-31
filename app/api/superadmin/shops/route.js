import { NextResponse } from 'next/server';
import { sql, getTimestamp } from '@/lib/db';
import { SHOP_CONFIG } from '@/lib/shop-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!sql) {
    return NextResponse.json([{
      slug: 'default', name: SHOP_CONFIG.name, status: 'active',
      featured: false, orderCount: 0, revenue: 0, createdAt: new Date().toISOString(),
    }]);
  }

  try {
    const rows = await sql`
      SELECT
        s.slug, s.name, s.short_name, s.tagline, s.logo_url, s.hero_image_url,
        s.status, s.featured, s.whatsapp_number, s.created_at,
        COUNT(o.id)::int            AS order_count,
        COALESCE(SUM(o.total_price), 0) AS revenue
      FROM shops s
      LEFT JOIN orders o ON o.shop_slug = s.slug
      GROUP BY s.slug, s.name, s.short_name, s.tagline, s.logo_url, s.hero_image_url,
               s.status, s.featured, s.whatsapp_number, s.created_at
      ORDER BY s.created_at DESC
    `;
    return NextResponse.json(rows.map(r => ({
      slug: r.slug, name: r.name, shortName: r.short_name,
      tagline: r.tagline, logoUrl: r.logo_url, heroImageUrl: r.hero_image_url,
      status: r.status || 'active', featured: r.featured || false,
      whatsappNumber: r.whatsapp_number,
      orderCount: r.order_count, revenue: Number(r.revenue),
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error('Superadmin shops error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!sql) return NextResponse.json({ error: 'No DB' }, { status: 503 });

  try {
    const { slug, featured, status } = await req.json();
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    await sql`
      UPDATE shops
      SET
        featured   = COALESCE(${featured ?? null}, featured),
        status     = COALESCE(${status  ?? null}, status),
        updated_at = ${getTimestamp()}
      WHERE slug = ${slug}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!sql) return NextResponse.json({ error: 'No DB' }, { status: 503 });

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    await sql`DELETE FROM shops WHERE slug = ${slug}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
