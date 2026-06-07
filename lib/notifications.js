import { sql, generateId, getTimestamp } from './db';
import { Resend } from 'resend';

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export const NOTIFICATION_TYPES = {
  QUOTE_REQUEST_RECEIVED: 'quote_request_received',
  QUOTE_READY: 'quote_ready',
  QUOTE_ACCEPTED: 'quote_accepted',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_READY: 'order_ready',
  PAYMENT_CONFIRMED: 'payment_confirmed',
};

export const NOTIFICATION_TEMPLATES = {
  quote_request_received: {
    title: 'New quote request received',
    message: 'A customer has requested a quote for {itemCount} items',
    subject: 'New quote request - {shopName}',
  },
  quote_ready: {
    title: 'Your quote is ready!',
    message: 'Check your quote for {itemCount} items - Final price: R{price}',
    subject: 'Your quote from {shopName} is ready',
  },
  quote_accepted: {
    title: 'Quote accepted!',
    message: 'The customer has accepted your quote for R{price}',
    subject: 'Quote accepted - {shopName}',
  },
  order_confirmed: {
    title: 'Order confirmed',
    message: 'Your order for {itemCount} items has been confirmed',
    subject: 'Order confirmed - {shopName}',
  },
  order_ready: {
    title: 'Your order is ready',
    message: 'Your order is ready for pickup/delivery',
    subject: 'Order ready - {shopName}',
  },
  payment_confirmed: {
    title: 'Payment received',
    message: 'Payment of R{price} has been received and confirmed',
    subject: 'Payment confirmed - {shopName}',
  },
};

export async function createNotification({
  userId = null,
  userEmail,
  userType = 'customer',
  type,
  title,
  message,
  relatedQuoteId = null,
  relatedOrderId = null,
}) {
  if (!sql || !userEmail) return null;

  try {
    const notificationId = generateId();
    await sql`
      INSERT INTO notifications (
        id, user_id, user_email, user_type, type, title, message,
        related_quote_id, related_order_id, created_at
      )
      VALUES (
        ${notificationId}, ${userId}, ${userEmail}, ${userType}, ${type},
        ${title}, ${message}, ${relatedQuoteId}, ${relatedOrderId}, ${getTimestamp()}
      )
    `;
    return notificationId;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

export async function sendEmailNotification({
  toEmail,
  subject,
  message,
  htmlContent,
}) {
  if (!resend) {
    console.warn('Resend not configured, skipping email');
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@dialabraai.com',
      to: toEmail,
      subject,
      html: htmlContent || `<p>${message}</p>`,
    });
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    return null;
  }
}

export async function getNotifications(userEmail, userType = 'customer', limit = 50) {
  if (!sql || !userEmail) return [];

  try {
    const notifications = await sql`
      SELECT * FROM notifications
      WHERE user_email = ${userEmail} AND user_type = ${userType}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return notifications || [];
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId) {
  if (!sql) return null;

  try {
    await sql`
      UPDATE notifications
      SET is_read = true, read_at = ${getTimestamp()}
      WHERE id = ${notificationId}
    `;
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

export async function getUnreadCount(userEmail, userType = 'customer') {
  if (!sql || !userEmail) return 0;

  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_email = ${userEmail} AND user_type = ${userType} AND is_read = false
    `;
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    return 0;
  }
}
