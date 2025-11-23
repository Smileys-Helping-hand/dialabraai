import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { menuCategories } from '../../../lib/utils';

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { id, name, description = '', price, category, image_url, delete: shouldDelete } = body || {};

  if (!id) {
    return NextResponse.json({ error: 'Menu item id is required.' }, { status: 400 });
  }

  if (shouldDelete) {
    const { data, error } = await supabaseAdmin.from('menu').delete().eq('id', id).select('id').single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ deleted: data?.id });
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

  const { data, error } = await supabaseAdmin
    .from('menu')
    .update({ name, description, price: numericPrice, category, image_url })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}
