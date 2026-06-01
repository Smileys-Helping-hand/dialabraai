import { NextResponse } from 'next/server';
import { sql, generateId, getTimestamp } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PLANS = ['free', 'starter', 'growth', 'pro', 'enterprise'];

async function ensureTable() {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS shop_owners (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      phone         TEXT DEFAULT '',
      shop_slugs    TEXT[] DEFAULT '{}',
      plan          TEXT DEFAULT 'free',
      plan_stage    INTEGER DEFAULT 1,
      plan_expires_at TIMESTAMPTZ,
      plan_started_at TIMESTAMPTZ DEFAULT NOW(),
      notes         TEXT DEFAULT '',
      status        TEXT DEFAULT 'active',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ
    )
  `;
}

export async function GET(req) {
  if (!sql) return NextResponse.json({ error: 'No DB' }, { status: 503 });

  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const plan   = searchParams.get('plan');
    const status = searchParams.get('status');

    const rows = await sql`
      SELECT
        o.*,
        (
          SELECT COUNT(*)::int FROM shops s
          WHERE s.slug = ANY(o.shop_slugs)
        ) AS linked_shops,
        (
          SELECT COUNT(*)::int FROM orders ord
          WHERE ord.shop_slug = ANY(o.shop_slugs)
        ) AS total_orders,
        (
          SELECT COALESCE(SUM(ord.total_price),0) FROM orders ord
          WHERE ord.shop_slug = ANY(o.shop_slugs)
        ) AS total_revenue
      FROM shop_owners o
      WHERE
        (${plan   ?? null} IS NULL OR o.plan   = ${plan   ?? ''})
        AND
        (${status ?? null} IS NULL OR o.status = ${status ?? ''})
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      shopSlugs: r.shop_slugs || [],
      plan: r.plan,
      planStage: r.plan_stage,
      planExpiresAt: r.plan_expires_at,
      planStartedAt: r.plan_started_at,
      notes: r.notes,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      linkedShops: r.linked_shops,
      totalOrders: r.total_orders,
      totalRevenue: Number(r.total_revenue),
    })));
  } catch (err) {
    console.error('Owners GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!sql) return NextResponse.json({ error: 'No DB' }, { status: 503 });

  try {
    await ensureTable();
    const body = await req.json();
    const { name, email, phone = '', shopSlugs = [], plan = 'free', notes = '' } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email required' }, { status: 400 });
    }
    if (!PLANS.includes(plan)) {
      return NextResponse.json({ error: 'invalid plan' }, { status: 400 });
    }

    const planStage = PLANS.indexOf(plan) + 1;
    const id = generateId();

    await sql`
      INSERT INTO shop_owners (id, name, email, phone, shop_slugs, plan, plan_stage, notes, plan_started_at, created_at)
      VALUES (
        ${id}, ${name}, ${email.toLowerCase().trim()}, ${phone},
        ${shopSlugs}, ${plan}, ${planStage}, ${notes},
        NOW(), ${getTimestamp()}
      )
    `;

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    if (err.message?.includes('unique')) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!sql) return NextResponse.json({ error: 'No DB' }, { status: 503 });

  try {
    const body = await req.json();
    const { id, name, email, phone, shopSlugs, plan, planExpiresAt, notes, status } = body;

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const planStage = plan ? PLANS.indexOf(plan) + 1 : null;

    await sql`
      UPDATE shop_owners SET
        name            = COALESCE(${name       ?? null}, name),
        email           = COALESCE(${email      ?? null}, email),
        phone           = COALESCE(${phone      ?? null}, phone),
        shop_slugs      = COALESCE(${shopSlugs  ?? null}, shop_slugs),
        plan            = COALESCE(${plan       ?? null}, plan),
        plan_stage      = COALESCE(${planStage  ?? null}, plan_stage),
        plan_expires_at = COALESCE(${planExpiresAt ?? null}::TIMESTAMPTZ, plan_expires_at),
        notes           = COALESCE(${notes      ?? null}, notes),
        status          = COALESCE(${status     ?? null}, status),
        updated_at      = ${getTimestamp()}
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!sql) return NextResponse.json({ error: 'No DB' }, { status: 503 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await sql`DELETE FROM shop_owners WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
