import { NextResponse } from 'next/server';
import { sql, getTimestamp } from '@/lib/db';
import { menuCategories } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  if (!sql) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
  }

  const body = await request.json();
  const { id, name, description = '', price, category, image_url, delete: shouldDelete } = body || {};

  if (!id) {
    return NextResponse.json({ error: 'Menu item id is required.' }, { status: 400 });
  }

  try {
    if (shouldDelete) {
      await sql`DELETE FROM menu_items WHERE id = ${id}`;
      return NextResponse.json({ deleted: id });
    }

    if (!name || typeof price === 'undefined' || !category) {
      return NextResponse.json({ error: 'Name, price, and category are required for updates.' }, { status: 400 });
    }

    if (!menuCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category provided.' }, { status: 400 });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: 'Price must be a positive number.' }, { status: 400 });
    }

    const updated_at = getTimestamp();
    await sql`
      UPDATE menu_items
      SET name = ${name}, description = ${description}, price = ${numericPrice},
          category = ${category}, image_url = ${image_url || ''}, available = true, updated_at = ${updated_at}
      WHERE id = ${id}
    `;
    const [item] = await sql`SELECT * FROM menu_items WHERE id = ${id}`;
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
