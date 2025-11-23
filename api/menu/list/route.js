import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  if (!supabaseAdmin) {
    return new Response(
      JSON.stringify({ error: 'Supabase client is not configured. Please add environment variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { data, error } = await supabaseAdmin
    .from('menu')
    .select('id,name,category,description,price,image_url')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch menu:', error.message);
    return new Response(JSON.stringify({ error: 'Unable to load menu items right now.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data || []), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
