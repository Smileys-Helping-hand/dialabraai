import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';
import { randomBytes } from 'crypto';

export async function GET(request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'Missing appId' }, { status: 400 });
    }

    const webhooks = await sql`
      SELECT id, url, events, active, fail_count, last_fired_at, created_at
      FROM webhooks
      WHERE app_id = ${appId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('[superadmin/webhooks] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { appId, url, events = [] } = await request.json();

    if (!appId || !url) {
      return NextResponse.json({ error: 'Missing appId or url' }, { status: 400 });
    }

    const id = `wh_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const secret = randomBytes(32).toString('hex');

    const result = await sql`
      INSERT INTO webhooks (id, app_id, url, events, secret)
      VALUES (${id}, ${appId}, ${url}, ${events}, ${secret})
      RETURNING id, url, events, active, fail_count, last_fired_at, created_at
    `;

    return NextResponse.json({ webhook: result[0] }, { status: 201 });
  } catch (error) {
    console.error('[superadmin/webhooks] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
