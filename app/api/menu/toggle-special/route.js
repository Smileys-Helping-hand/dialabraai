import { NextResponse } from 'next/server';
import { sql, getTimestamp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!sql) return NextResponse.json({ error: 'No DB' }, { status: 503 });
  try {
    const { id, isSpecial, shop_slug = 'default' } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await sql`
      UPDATE menu_items
      SET is_special = ${Boolean(isSpecial)}, updated_at = ${getTimestamp()}
      WHERE id = ${id} AND COALESCE(shop_slug, 'default') = ${shop_slug}
    `;
    return NextResponse.json({ ok: true, id, isSpecial });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
