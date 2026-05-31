import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const apps = await sql`
      SELECT
        a.*,
        COUNT(k.id) as key_count,
        COUNT(DISTINCT w.id) as webhook_count
      FROM registered_apps a
      LEFT JOIN api_keys k ON k.app_id = a.id AND k.revoked_at IS NULL
      LEFT JOIN webhooks w ON w.app_id = a.id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json({ apps });
  } catch (error) {
    console.error('[superadmin/apps] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { name, type = 'client', slug, description = '', ownerEmail = '' } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Missing name or slug' }, { status: 400 });
    }

    const id = `app_${Date.now()}_${randomBytes(4).toString('hex')}`;

    const result = await sql`
      INSERT INTO registered_apps (id, name, type, slug, description, owner_email)
      VALUES (${id}, ${name}, ${type}, ${slug}, ${description}, ${ownerEmail})
      RETURNING *
    `;

    return NextResponse.json({ app: result[0] }, { status: 201 });
  } catch (error) {
    console.error('[superadmin/apps] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
