import { NextResponse } from 'next/server';
import { docClient, TABLES, updateItem, deleteItem, getItem, getTimestamp } from '@/lib/dynamodb';
import { menuCategories } from '@/lib/utils';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  if (!docClient) {
    return NextResponse.json(
      { error: 'DynamoDB is not configured. Add AWS credentials.' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { id, name, description = '', price, category, image_url, delete: shouldDelete } = body || {};

  if (!id) {
    return NextResponse.json({ error: 'Menu item id is required.' }, { status: 400 });
  }

  try {
    if (shouldDelete) {
      await deleteItem(TABLES.MENU, { id });
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

    await updateItem(TABLES.MENU, { id }, {
      name,
      description,
      price: numericPrice,
      category,
      image_url: image_url || '',
      available: true,
      updated_at: getTimestamp(),
    });

    const item = await getItem(TABLES.MENU, { id });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
