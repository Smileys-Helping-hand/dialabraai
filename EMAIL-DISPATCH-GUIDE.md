# 📧 Hybrid Email Delivery System Guide

## Overview

Your Dial-A-Braai app now has a **Hybrid Email Delivery Mode** that intelligently switches between:

- ✅ **REAL MODE**: Sends actual emails via AWS SES when credentials are configured
- 🧪 **SIMULATION MODE**: Logs emails to console when AWS credentials are missing (no crashes!)

This allows you to:
1. Test the app **RIGHT NOW** without AWS setup
2. Switch to real emails **INSTANTLY** by adding credentials to `.env.local`

---

## 🚀 Quick Start

### Step 1: Test in Simulation Mode (NOW!)

```bash
# No AWS setup needed! Just run your app:
npm run dev
```

Visit `/admin/dashboard` and click **"🧪 Test Email System"**

You'll see:
- 🟡 **SIMULATION MODE** badge
- Email details logged to your console
- Success response with mock ID

### Step 2: Enable Real Emails (When Ready)

1. **Get AWS SES Credentials** (see AWS Setup below)
2. **Update `.env.local`**:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_REGION=us-east-1
   AWS_SES_FROM_EMAIL=noreply@yourdomain.com
   ```
3. **Restart your app**: `npm run dev`
4. **Test again** - You'll now see 🟢 **REAL MODE** badge!

---

## 🔐 Security Setup

The dispatch API requires an internal key to prevent unauthorized use.

### Generate a Secure Key

```bash
# On Windows PowerShell:
$key = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Output $key

# Or use any random string generator
```

### Add to `.env.local`

```env
INTERNAL_API_KEY=your-generated-key-here
NEXT_PUBLIC_INTERNAL_API_KEY=your-generated-key-here
```

---

## 📡 API Usage

### Endpoint: `POST /api/dispatch`

**Request Body:**
```json
{
  "secretKey": "your-internal-api-key",
  "to": "customer@example.com",
  "subject": "Order Confirmation",
  "body": "<h1>Your Order</h1><p>Thanks for your order!</p>",
  "orderId": "order-123"
}
```

**Response (Real Mode):**
```json
{
  "status": "sent",
  "provider": "aws-ses",
  "id": "0102018d-a1b2-c3d4-e5f6-1234567890ab-000000",
  "timestamp": "2026-01-08T12:34:56.789Z"
}
```

**Response (Simulation Mode):**
```json
{
  "status": "simulated",
  "provider": "console-log",
  "id": "mock-1704715234567-a1b2c3d4e",
  "timestamp": "2026-01-08T12:34:56.789Z",
  "note": "Add AWS credentials to .env to enable real email delivery"
}
```

**Error Response:**
```json
{
  "error": "Unauthorized"
}
```

---

## ☁️ AWS SES Setup

### Prerequisites

1. AWS Account with verified email domain
2. SES out of sandbox mode (to send to any email)

### Steps

1. **Sign in to AWS Console** → Navigate to **SES (Simple Email Service)**

2. **Verify Your Domain/Email**:
   - Go to "Verified identities"
   - Click "Create identity"
   - Choose "Domain" or "Email address"
   - Follow verification steps (DNS records for domain, or click link for email)

3. **Create IAM User for SES**:
   - Go to IAM → Users → Create user
   - Name: `dialabraai-ses-user`
   - Attach policy: `AmazonSESFullAccess` (or create custom policy with `ses:SendEmail`)

4. **Generate Access Keys**:
   - Select the user → Security credentials → Create access key
   - Choose "Application running outside AWS"
   - **Copy the keys** (you won't see them again!)

5. **Configure `.env.local`**:
   ```env
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=wJalr...
   AWS_REGION=us-east-1
   AWS_SES_FROM_EMAIL=noreply@yourdomain.com
   ```

6. **Request Production Access** (if needed):
   - Go to SES → Account dashboard → "Request production access"
   - Fill out the form explaining your use case
   - Usually approved within 24 hours

---

## 🧪 Testing the System

### Dashboard Test Widget

1. Navigate to `/admin/dashboard`
2. Find the **"📧 Email System Status"** widget
3. Click **"🧪 Test Email System"**
4. Check the badge color:
   - 🟢 **Green (Sent)**: Real Mode - Email actually sent!
   - 🟡 **Amber (Simulated)**: Simulation Mode - Check console logs
   - 🔴 **Red (Error)**: Something went wrong - Check error message

### Console Logs (Simulation Mode)

When in simulation mode, you'll see beautifully formatted logs:

```
============================================================
📮 SIMULATION MODE: Email would be sent
============================================================
From: noreply@dialabraai.com
To: test@example.com
Subject: Test Email - Dial-A-Braai
Order ID: test-1704715234567
------------------------------------------------------------
Body Preview:
<h1>Test Email</h1><p>This is a test email from your Dial-A-Braai system.</p>...
============================================================

✅ Simulation complete! Mock ID: mock-1704715234567-a1b2c3d4e
```

---

## 🎨 UI Badge Reference

The Email Dispatch Tester shows different badges based on status:

| Badge | Meaning | Action |
|-------|---------|--------|
| 🟢 **REAL MODE** | AWS credentials configured, real emails sent | No action needed |
| 🟡 **SIMULATION MODE** | No AWS credentials, emails logged to console | Add AWS credentials when ready |
| 🔴 **ERROR** | Something went wrong | Check error message and logs |

---

## 🔄 Switching Between Modes

### To Simulation Mode
1. Remove or comment out AWS credentials in `.env.local`:
   ```env
   # AWS_ACCESS_KEY_ID=
   # AWS_SECRET_ACCESS_KEY=
   ```
2. Restart app: `npm run dev`

### To Real Mode
1. Add AWS credentials to `.env.local`
2. Restart app: `npm run dev`

**No code changes needed!** The system automatically detects the mode.

---

## 📝 Integration Example

Here's how to integrate email dispatch into your order flow:

```javascript
async function sendOrderConfirmation(order) {
  try {
    const emailBody = `
      <h1>Order Confirmation</h1>
      <p>Hi ${order.customer_name},</p>
      <p>Your order #${order.id.slice(0, 8)} has been received!</p>
      <h2>Order Details:</h2>
      <ul>
        ${order.items.map(item => `
          <li>${item.name} x${item.quantity}</li>
        `).join('')}
      </ul>
      <p><strong>Total: R${order.total_price}</strong></p>
      <p>We'll notify you when it's ready!</p>
    `;

    const response = await fetch('/api/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secretKey: process.env.NEXT_PUBLIC_INTERNAL_API_KEY,
        to: order.customer_email,
        subject: `Order Confirmation - Dial-A-Braai`,
        body: emailBody,
        orderId: order.id,
      }),
    });

    const result = await response.json();
    
    if (result.status === 'sent') {
      console.log('✅ Email sent!', result.id);
    } else if (result.status === 'simulated') {
      console.log('🧪 Email simulated (check console for details)');
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
```

---

## 🛠️ Troubleshooting

### "Unauthorized" Error
- Check that `INTERNAL_API_KEY` matches `NEXT_PUBLIC_INTERNAL_API_KEY`
- Ensure you're passing `secretKey` in the request body

### Emails Not Sending (Real Mode)
- Verify AWS credentials are correct
- Check that "From" email is verified in AWS SES
- Ensure IAM user has `ses:SendEmail` permission
- Check AWS region matches your SES setup

### "Email address is not verified" Error
- You're in SES Sandbox mode
- Either verify the recipient email OR request production access

### Still Showing Simulation Mode
- Verify AWS credentials are in `.env.local` (not `.env.example`)
- Restart the dev server after adding credentials
- Check for typos in environment variable names

---

## 📦 Files Created

- `/app/api/dispatch/route.js` - Main API endpoint with hybrid logic
- `/components/EmailDispatchTester.jsx` - Dashboard test widget
- `.env.example` - Environment variables template
- `EMAIL-DISPATCH-GUIDE.md` - This guide!

---

## 🎯 Next Steps

1. ✅ Test in Simulation Mode (works now!)
2. ⚙️ Set up AWS SES when ready
3. 📧 Integrate into order confirmation flow
4. 🚀 Deploy to production with real credentials

---

## 💡 Pro Tips

- **Development**: Use Simulation Mode - no AWS costs, instant feedback
- **Staging**: Use real mode with a test email list
- **Production**: Use real mode with production SES setup
- **Cost**: AWS SES = $0.10 per 1,000 emails (very cheap!)
- **Limits**: SES Sandbox = 200 emails/day, Production = 50,000+/day

---

**Need Help?** Check the AWS SES documentation or reach out to AWS support!
