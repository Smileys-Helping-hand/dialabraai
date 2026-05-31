import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';

export async function PATCH(request, { params }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { id } = params;
    const { name, budgetZar, active } = await request.json();

    const updates = [];
    const values = [id];
    let paramIndex = 2;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (budgetZar !== undefined) {
      updates.push(`budget_zar = $${paramIndex++}`);
      values.push(budgetZar);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(active);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const result = await sql.unsafe(
      `UPDATE ad_campaigns SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    return NextResponse.json({ campaign: result[0] });
  } catch (error) {
    console.error('[superadmin/campaigns/[id]] PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const { id } = params;
    await sql`DELETE FROM ad_campaigns WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[superadmin/campaigns/[id]] DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
