import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SA_USER = process.env.SUPER_ADMIN_USERNAME || 'mraaziqp';
const SA_PASS = process.env.SUPER_ADMIN_PASSWORD || '114477';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (
      String(username || '').trim() === SA_USER &&
      String(password || '') === SA_PASS
    ) {
      return NextResponse.json({ ok: true, username: SA_USER });
    }
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}

export async function GET(req) {
  const auth = req.headers.get('x-superadmin-token');
  const valid = auth === `${SA_USER}:${SA_PASS}`;
  return NextResponse.json({ valid });
}
