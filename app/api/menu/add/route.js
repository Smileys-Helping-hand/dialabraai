import { NextResponse } from 'next/server';
import { docClient, TABLES, createItem, generateId, getTimestamp } from '@/lib/dynamodb';
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
    const item = {
      id: itemId,
      name,
      description,
      price: numericPrice,
      category,
      image_url: image_url || '',
      available: true,
      created_at: getTimestamp(),
    };

    await createItem(TABLES.MENU, item);
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
