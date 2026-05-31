import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';
import { revokeApiKey, generateApiKey } from '@/lib/api-keys.js';

export async function DELETE(request, { params }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { id } = params;
    await revokeApiKey(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[superadmin/api-keys/[id]] DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { id } = params;
    const { action } = await request.json();

    if (action !== 'rotate') {
      return NextResponse.json({ error: 'Only rotate action supported' }, { status: 400 });
    }

    // Get the old key info
    const oldKey = await sql`SELECT app_id, name, scopes FROM api_keys WHERE id = ${id}`;
    if (oldKey.length === 0) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    // Revoke old key
    await revokeApiKey(id);

    // Generate new key
    const newKey = await generateApiKey(oldKey[0].app_id, oldKey[0].name, oldKey[0].scopes);

    return NextResponse.json({
      key: {
        id: newKey.id,
        fullKey: newKey.fullKey,
        keyPrefix: newKey.keyPrefix,
        name: oldKey[0].name,
        scopes: oldKey[0].scopes,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[superadmin/api-keys/[id]] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
