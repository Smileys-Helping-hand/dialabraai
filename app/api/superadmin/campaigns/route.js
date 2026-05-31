import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const campaigns = await sql`
      SELECT
        c.*,
        COUNT(ae.id) FILTER (WHERE ae.event_type = 'click') as click_count,
        COUNT(ae.id) FILTER (WHERE ae.event_type = 'conversion') as conversion_count
      FROM ad_campaigns c
      LEFT JOIN ad_events ae ON ae.campaign_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('[superadmin/campaigns] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const {
      name,
      platform,
      utmSource,
      utmMedium = 'cpc',
      utmCampaign,
      utmContent = '',
      budgetZar = 0,
    } = await request.json();

    if (!name || !platform || !utmSource || !utmCampaign) {
      return NextResponse.json({
        error: 'Missing required fields: name, platform, utmSource, utmCampaign',
      }, { status: 400 });
    }

    const id = `camp_${Date.now()}_${randomBytes(4).toString('hex')}`;

    const result = await sql`
      INSERT INTO ad_campaigns (id, name, platform, utm_source, utm_medium, utm_campaign, utm_content, budget_zar)
      VALUES (${id}, ${name}, ${platform}, ${utmSource}, ${utmMedium}, ${utmCampaign}, ${utmContent}, ${budgetZar})
      RETURNING *
    `;

    return NextResponse.json({ campaign: result[0] }, { status: 201 });
  } catch (error) {
    console.error('[superadmin/campaigns] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
