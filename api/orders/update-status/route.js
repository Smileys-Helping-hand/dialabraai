import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

const allowedStatuses = ['pending', 'preparing', 'ready', 'completed'];

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { id, status } = body || {};

  if (!id || !status) {
    return NextResponse.json({ error: 'Order id and status are required.' }, { status: 400 });
  }

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
