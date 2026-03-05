import { NextResponse } from 'next/server';

/**
 * Email dispatch via Resend (https://resend.com).
 * Set RESEND_API_KEY in your Vercel environment variables.
 * If not configured, falls back to simulation/console mode.
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { secretKey, to, subject, body: emailBody, orderId } = body;

    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

    if (!INTERNAL_API_KEY) {
      console.error('⚠️ INTERNAL_API_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (secretKey !== INTERNAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@dialabraai.co.za';

    if (RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html: emailBody,
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json({ error: 'Email delivery failed', details: error.message }, { status: 500 });
      }

      return NextResponse.json({
        status: 'sent',
        provider: 'resend',
        id: data.id,
        timestamp: new Date().toISOString(),
      });
    }

    // Simulation mode — no email provider configured
    console.log('📮 SIMULATION MODE: Email would be sent');
    console.log('To:', to, '| Subject:', subject, '| Order:', orderId || 'N/A');

    const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return NextResponse.json({
      status: 'simulated',
      provider: 'console-log',
      id: mockId,
      timestamp: new Date().toISOString(),
      note: 'Set RESEND_API_KEY in Vercel to enable real email delivery',
    });

  } catch (error) {
    console.error('💥 Dispatch API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
