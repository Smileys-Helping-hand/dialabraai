import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';
import { generateApiKey } from '@/lib/api-keys.js';

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

    const keys = await sql`
      SELECT id, app_id, name, key_prefix, scopes, last_used_at, revoked_at, created_at
      FROM api_keys
      WHERE app_id = ${appId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('[superadmin/api-keys] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { appId, name, scopes = [] } = await request.json();

    if (!appId || !name) {
      return NextResponse.json({ error: 'Missing appId or name' }, { status: 400 });
    }

    const result = await generateApiKey(appId, name, scopes);

    return NextResponse.json({
      key: {
        id: result.id,
        fullKey: result.fullKey,
        keyPrefix: result.keyPrefix,
        name,
        scopes,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[superadmin/api-keys] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
