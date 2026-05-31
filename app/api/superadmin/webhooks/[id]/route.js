import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';

export async function PATCH(request, { params }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { id } = params;
    const { url, events, active } = await request.json();

    const updates = [];
    const values = [id];
    let paramIndex = 2;

    if (url !== undefined) {
      updates.push(`url = $${paramIndex++}`);
      values.push(url);
    }
    if (events !== undefined) {
      updates.push(`events = $${paramIndex++}`);
      values.push(events);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(active);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const result = await sql.unsafe(
      `UPDATE webhooks SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    return NextResponse.json({ webhook: result[0] });
  } catch (error) {
    console.error('[superadmin/webhooks/[id]] PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { id } = params;
    await sql`DELETE FROM webhooks WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[superadmin/webhooks/[id]] DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
