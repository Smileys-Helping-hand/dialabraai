import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { items, customer_name, customer_phone, notes, total_price } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  if (!customer_name || !customer_phone) {
    return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
  }

  const payload = {
    items,
    total_price: Number(total_price) || 0,
    customer_name,
    customer_phone,
    notes: notes || '',
    status: 'pending',
    paid: false,
  };

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    console.error('Supabase order insert failed', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 200 });
}
