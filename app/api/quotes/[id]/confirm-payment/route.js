import { NextResponse } from 'next/server';
import { sql, getTimestamp } from '@/lib/db';
import { createNotification } from '@/lib/notifications';

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { payment_method, payment_reference = '', confirmed_by_email = '' } = body || {};

  if (!payment_method) {
    return NextResponse.json({ error: 'payment_method is required' }, { status: 400 });
  }

  if (!sql) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  try {
    const quotes = await sql`
      SELECT * FROM quotes WHERE id = ${id}
    `;

    if (quotes.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const quote = quotes[0];

    await sql`
      UPDATE quotes
      SET payment_method = ${payment_method}, payment_confirmed = true
      WHERE id = ${id}
    `;

    // Notify customer that payment has been confirmed
    await createNotification({
      userEmail: quote.customer_email,
      userType: 'customer',
      type: 'payment_confirmed',
      title: 'Payment confirmed',
      message: 'Your payment has been received and confirmed.',
      relatedQuoteId: id,
    });

    return NextResponse.json(
      { quote: { ...quote, payment_method, payment_confirmed: true } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to confirm payment:', error.message);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
