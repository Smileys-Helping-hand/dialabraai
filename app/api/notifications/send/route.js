import { NextResponse } from 'next/server';
import { createNotification, sendEmailNotification, NOTIFICATION_TEMPLATES } from '@/lib/notifications';

export async function POST(request) {
  const body = await request.json();
  const {
    userEmail,
    userType = 'customer',
    notificationType,
    title,
    message,
    relatedQuoteId = null,
    relatedOrderId = null,
    sendEmail = true,
    emailData = {},
  } = body;

  if (!userEmail || !notificationType) {
    return NextResponse.json(
      { error: 'userEmail and notificationType are required' },
      { status: 400 }
    );
  }

  try {
    const notifId = await createNotification({
      userEmail,
      userType,
      type: notificationType,
      title: title || 'Notification',
      message: message || 'You have a new notification',
      relatedQuoteId,
      relatedOrderId,
    });

    if (sendEmail && emailData.subject && emailData.htmlContent) {
      await sendEmailNotification({
        toEmail: userEmail,
        subject: emailData.subject,
        message: emailData.message || message,
        htmlContent: emailData.htmlContent,
      });
    }

    return NextResponse.json({ id: notifId }, { status: 200 });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
