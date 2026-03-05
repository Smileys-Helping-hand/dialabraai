import { NextResponse } from 'next/server';
import { sql, generateId, getTimestamp } from '@/lib/db';
import { menuCategories } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  if (!sql) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
  }

  const body = await request.json();
  const { name, description = '', price, category, image_url = '' } = body || {};

  if (!name || typeof price === 'undefined' || !category) {
    return NextResponse.json({ error: 'Name, price, and category are required.' }, { status: 400 });
  }

  if (!menuCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category provided.' }, { status: 400 });
  }

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    return NextResponse.json({ error: 'Price must be a positive number.' }, { status: 400 });
  }

  try {
    const itemId = generateId();
    const created_at = getTimestamp();
    await sql`
      INSERT INTO menu_items (id, name, description, price, category, image_url, available, created_at)
      VALUES (${itemId}, ${name}, ${description}, ${numericPrice}, ${category}, ${image_url}, true, ${created_at})
    `;
    const [item] = await sql`SELECT * FROM menu_items WHERE id = ${itemId}`;
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
