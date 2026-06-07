import { normalizeWhatsappNumber } from './shop-config';

const env = typeof process !== 'undefined' ? process.env : {};

export const MESSENGERS = {
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    enabled: !!env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  },
  wechat: {
    name: 'WeChat',
    icon: '🌐',
    enabled: !!env.NEXT_PUBLIC_WECHAT_ID,
  },
  email: {
    name: 'Email',
    icon: '📧',
    enabled: !!env.NEXT_PUBLIC_SUPPORT_EMAIL,
  },
  sms: {
    name: 'SMS',
    icon: '📱',
    enabled: !!env.NEXT_PUBLIC_SMS_ENABLED,
  },
};

export function buildWhatsAppMessage({
  type,
  quoteId,
  customerName,
  itemCount,
  price,
  shopName,
}) {
  const messages = {
    quote_ready: `Hi ${customerName}, your quote from ${shopName} is ready! ${itemCount} item(s) - R${price}. Review and accept here: [link]`,
    quote_accepted: `Thank you for accepting the quote! Your order is confirmed. We'll contact you shortly with delivery details.`,
    payment_pending: `Hi ${customerName}, payment is pending for quote #${quoteId}. Amount: R${price}`,
  };
  return messages[type] || messages.quote_ready;
}

export function buildWeChatMessage({
  type,
  quoteId,
  customerName,
  itemCount,
  price,
  shopName,
}) {
  const messages = {
    quote_ready: `Hi ${customerName}, your quote from ${shopName} is ready!\n\nItems: ${itemCount}\nPrice: R${price}\n\nPlease review and accept your quote.`,
    quote_accepted: `Thank you for accepting the quote! Your order is confirmed. We'll contact you shortly.`,
    payment_pending: `Hi ${customerName}, payment is pending.\n\nAmount: R${price}\n\nPlease confirm payment details.`,
  };
  return messages[type] || messages.quote_ready;
}

export async function sendWhatsAppNotification({
  phoneNumber,
  message,
  mediaUrl = null,
}) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    console.log('[WhatsApp] Twilio not configured, skipping');
    return null;
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${normalizeWhatsappNumber(env.NEXT_PUBLIC_WHATSAPP_NUMBER)}`,
        To: `whatsapp:${normalizeWhatsappNumber(phoneNumber)}`,
        Body: message,
        ...(mediaUrl && { MediaUrl: mediaUrl }),
      }),
    });

    if (!response.ok) throw new Error('Twilio API error');
    return await response.json();
  } catch (error) {
    console.error('[WhatsApp] Failed to send message:', error);
    return null;
  }
}

export async function sendWeChatNotification({
  openId,
  message,
  templateId = null,
  data = {},
}) {
  if (!env.WECHAT_ACCESS_TOKEN) {
    console.log('[WeChat] Access token not configured, skipping');
    return null;
  }

  try {
    const response = await fetch(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${env.WECHAT_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        touser: openId,
        template_id: templateId,
        data: {
          first: { value: message },
          ...data,
        },
      }),
    });

    if (!response.ok) throw new Error('WeChat API error');
    return await response.json();
  } catch (error) {
    console.error('[WeChat] Failed to send notification:', error);
    return null;
  }
}

export function getEnabledMessengers() {
  return Object.entries(MESSENGERS)
    .filter(([, config]) => config.enabled)
    .map(([key, config]) => ({ id: key, ...config }));
}

export function buildQuoteLink(quoteId, baseUrl = '') {
  return `${baseUrl}/quotes/${quoteId}`;
}

export function buildQuoteAcceptanceMessage(quoteId, baseUrl, messenger = 'whatsapp') {
  const link = buildQuoteLink(quoteId, baseUrl);
  const messages = {
    whatsapp: `Your quote is ready! Review and accept here: ${link}`,
    wechat: `Your quote is ready!\n\nClick here to review and accept: ${link}`,
    email: `Your quote is ready. <a href="${link}">Click here to review and accept</a>`,
    sms: `Your quote is ready: ${link}`,
  };
  return messages[messenger] || messages.whatsapp;
}
