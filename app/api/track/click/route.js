import { NextResponse } from 'next/server';
import { sql } from '@/lib/db.js';
import { randomBytes } from 'crypto';

export async function POST(request) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'No database' }, { status: 503 });
    }

    const {
      utmSource,
      utmCampaign,
      utmMedium,
      path = '/join',
      referrer,
    } = await request.json();

    if (!utmSource || !utmCampaign) {
      // Missing UTM params - just return success (don't fail client)
      return NextResponse.json({ success: true });
    }

    // Look up the campaign
    const campaigns = await sql`
      SELECT id FROM ad_campaigns
      WHERE utm_source = ${utmSource}
        AND utm_campaign = ${utmCampaign}
        AND active = true
    `;

    const campaignId = campaigns.length > 0 ? campaigns[0].id : null;

    // Get client IP
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               request.ip;

    // Record the click
    await sql`
      INSERT INTO ad_events (id, campaign_id, event_type, path, referrer, ip)
      VALUES (
        ${`evt_${Date.now()}_${randomBytes(4).toString('hex')}`},
        ${campaignId},
        'click',
        ${path},
        ${referrer || null},
        ${ip}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[track/click] POST error:', error);
    // Don't expose error to client
    return NextResponse.json({ success: true });
  }
}
