import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { id, paid = true } = body || {};

  if (!id) {
    return NextResponse.json({ error: 'Order id is required.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ paid })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
