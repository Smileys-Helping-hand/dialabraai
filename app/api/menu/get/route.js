const menu = [{ id: 'snoek-large', name: 'Snoek – Large', category: 'Seafood', price: 220 }];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const item = menu.find((m) => m.id === id);
  return new Response(JSON.stringify(item ?? null), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
