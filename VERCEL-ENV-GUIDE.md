# Vercel Environment Variables Complete Guide

**Last Updated:** June 7, 2026  
**For:** Production Deployment

---

## 📋 Quick Copy-Paste Template

See "Environment Variables List" section below for the complete list to paste into Vercel.

---

## 🔴 REQUIRED Variables (Must Have)

These are **absolutely required** for the application to function.

### 1. Database Connection
```
DATABASE_URL
```
**What it is:** PostgreSQL connection string (Neon database)  
**Format:** `postgresql://user:password@host.eu-west-2.aws.neon.tech/dbname?sslmode=require&channel_binding=require`  
**Where to get it:**
1. Go to https://neon.tech
2. Create a project
3. Get connection string
4. Copy it here

**Why needed:** All orders, quotes, customers, and notifications are stored here

---

### 2. Email Service
```
RESEND_API_KEY
RESEND_FROM_EMAIL
```

**RESEND_API_KEY**
- **What it is:** API key for email sending service
- **Format:** `re_xxxxxxxxxxxxx`
- **Where to get it:**
  1. Go to https://resend.com
  2. Sign up / Log in
  3. API Keys section
  4. Copy your API key

**RESEND_FROM_EMAIL**
- **What it is:** Email address emails will come from
- **Format:** `noreply@yourdomain.com`
- **Example:** `noreply@dialabraai.com`

**Why needed:** Send quote confirmations, payment notifications, order updates

---

### 3. Superadmin Credentials
```
SUPER_ADMIN_USERNAME
SUPER_ADMIN_PASSWORD
```

**What it is:** Login credentials for /superadmin dashboard  
**Format:** Any string (username), any strong password  
**Example:**
- Username: `admin`
- Password: `Your$Tr0ng!P@ssw0rd123`

**⚠️ IMPORTANT:** Use VERY strong password. This is admin access to your entire platform.

**Why needed:** Secure admin dashboard access

---

### 4. Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

**Where to get it:**
1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Project Settings → General tab
4. Copy all the configuration values
5. For Admin SDK:
   - Go to Service Accounts tab
   - Generate new private key
   - Download JSON
   - Extract values

**Why needed:** Customer authentication, order history, user profiles

---

## 🟢 PUBLIC Variables (Client-Side, Safe to Expose)

These appear in client code but contain no secrets.

```
NEXT_PUBLIC_SHOP_NAME
NEXT_PUBLIC_SHOP_SHORT_NAME
NEXT_PUBLIC_SHOP_TAGLINE
NEXT_PUBLIC_SHOP_DESCRIPTION
NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY
NEXT_PUBLIC_SUPPORT_PHONE_DIAL
NEXT_PUBLIC_SUPPORT_EMAIL
NEXT_PUBLIC_INSTAGRAM_HANDLE
NEXT_PUBLIC_INSTAGRAM_URL
NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_LOCATION_SUMMARY
NEXT_PUBLIC_SERVICE_AREAS
NEXT_PUBLIC_ORDER_TERMS
NEXT_PUBLIC_ESTIMATED_READY_TIME
NEXT_PUBLIC_CURRENCY_SYMBOL
NEXT_PUBLIC_PRIMARY_COLOR
NEXT_PUBLIC_ACCENT_COLOR
NEXT_PUBLIC_GOLD_COLOR
NEXT_PUBLIC_CREAM_COLOR
NEXT_PUBLIC_CHARCOAL_COLOR
NEXT_PUBLIC_LOGO_URL
NEXT_PUBLIC_HERO_IMAGE_URL
NEXT_PUBLIC_FONT_CHOICE
NEXT_PUBLIC_OPERATING_HOURS
NEXT_PUBLIC_PAYMENT_METHODS
NEXT_PUBLIC_DEFAULT_MENU_CATEGORIES
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_APP_TYPE
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Why public?** These are safe to show to customers. They define your shop's branding and contact info.

---

## 🟡 OPTIONAL Variables (Recommended for Full Features)

These enable advanced features but aren't required for basic operation.

### WhatsApp Integration
```
NEXT_PUBLIC_WHATSAPP_NUMBER
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
```

**What it is:** Auto-send WhatsApp messages for quotes and orders  
**Where to get it:**
1. Create Twilio account at https://twilio.com
2. Get WhatsApp sandbox number
3. Copy Account SID and Auth Token

**When to use:** You want automatic WhatsApp notifications

---

### WeChat Integration
```
NEXT_PUBLIC_WECHAT_ID
WECHAT_ACCESS_TOKEN
WECHAT_MCHID
WECHAT_SERIAL_NO
```

**What it is:** Send messages and payments via WeChat Official Account  
**Where to get it:**
1. Register WeChat Official Account at https://mp.weixin.qq.com
2. Get access token from admin panel
3. Configure payment (if needed)

**When to use:** You want to reach Chinese customers

---

### SMS Notifications
```
TWILIO_PHONE_NUMBER
SMS_ENABLED
```

**What it is:** Send SMS to customers for updates  
**Where to get it:** Twilio dashboard (same as WhatsApp)

**When to use:** Customers prefer SMS notifications

---

### Email Configuration
```
RESEND_FROM_EMAIL
RESEND_API_KEY
```

**Already listed above** - Required for core email functionality

---

## 🔵 Server-Side Only Variables

These should ONLY be in Vercel (not in client code).

```
DATABASE_URL
RESEND_API_KEY
SUPER_ADMIN_USERNAME
SUPER_ADMIN_PASSWORD
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
WECHAT_ACCESS_TOKEN
```

**⚠️ IMPORTANT:** Never expose these to client! Vercel keeps them secure.

---

# Complete Environment Variables List for Vercel

Copy and paste these into Vercel dashboard → Settings → Environment Variables

```
# ========================================
# 🔴 REQUIRED - ABSOLUTE MUST HAVE
# ========================================

# Database - PostgreSQL via Neon
DATABASE_URL=postgresql://user:password@host.eu-west-2.aws.neon.tech/dbname?sslmode=require&channel_binding=require

# Email Service - Resend
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Superadmin Access (STRONG PASSWORD!)
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=Your$Tr0ng!P@ssw0rd123

# Firebase - Get from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your_app_id:web:your_web_config
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"

# ========================================
# 🟡 OPTIONAL BUT RECOMMENDED
# ========================================

# WhatsApp Integration (Twilio)
NEXT_PUBLIC_WHATSAPP_NUMBER=27837864913
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token_here

# WeChat Integration
NEXT_PUBLIC_WECHAT_ID=your_wechat_id
WECHAT_ACCESS_TOKEN=your_access_token

# SMS Notifications (Optional)
SMS_ENABLED=false

# ========================================
# 🟢 SHOP BRANDING - Customize These!
# ========================================

NEXT_PUBLIC_SHOP_NAME=Graze
NEXT_PUBLIC_SHOP_SHORT_NAME=Graze
NEXT_PUBLIC_SHOP_TAGLINE=Fresh, local food delivered
NEXT_PUBLIC_SHOP_DESCRIPTION=Fast, fresh ordering for local food shops
NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY=081 749 2724
NEXT_PUBLIC_SUPPORT_PHONE_DIAL=0817492724
NEXT_PUBLIC_SUPPORT_EMAIL=hello@graze.local
NEXT_PUBLIC_INSTAGRAM_HANDLE=@graze
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/graze
NEXT_PUBLIC_LOCATION_SUMMARY=Built for local stores and takeaways
NEXT_PUBLIC_SERVICE_AREAS=In-store pickup and local delivery
NEXT_PUBLIC_ORDER_TERMS=Pay on collection or delivery
NEXT_PUBLIC_ESTIMATED_READY_TIME=30-45 minutes
NEXT_PUBLIC_CURRENCY_SYMBOL=R
NEXT_PUBLIC_OPERATING_HOURS=08:00 - 22:00
NEXT_PUBLIC_PAYMENT_METHODS=Cash, Card, Online Payment

# Colors - Hex codes
NEXT_PUBLIC_PRIMARY_COLOR=#762C1B
NEXT_PUBLIC_ACCENT_COLOR=#E46A28
NEXT_PUBLIC_GOLD_COLOR=#F4C056
NEXT_PUBLIC_CREAM_COLOR=#FFF4E2
NEXT_PUBLIC_CHARCOAL_COLOR=#1A1715

# URLs
NEXT_PUBLIC_LOGO_URL=https://your-domain.com/logo.png
NEXT_PUBLIC_HERO_IMAGE_URL=https://your-domain.com/hero.jpg

# Font Choice
NEXT_PUBLIC_FONT_CHOICE=jakarta

# Default Menu Categories
NEXT_PUBLIC_DEFAULT_MENU_CATEGORIES=Featured,Meals,Drinks,Desserts,Bundles

# App Info
NEXT_PUBLIC_APP_NAME=Graze
NEXT_PUBLIC_APP_TYPE=owned

# ========================================
# 🔵 SERVER-SIDE CONFIG
# ========================================

# Webhook Settings
WEBHOOK_TIMEOUT_MS=5000
WEBHOOK_FAILURE_THRESHOLD=5

# API Logging
LOG_RETENTION_DAYS=30
```

---

## 🎯 Step-by-Step Vercel Setup

### 1. Go to Vercel Dashboard
```
https://vercel.com/dashboard → Settings
```

### 2. Find Environment Variables
```
Settings → Environment Variables
```

### 3. Add Each Variable
For each variable above:
1. Click "Add New"
2. Enter variable name (exactly as written)
3. Enter variable value
4. Select environments: Production, Preview, Development
5. Click "Add"

### 4. Redeploy
```
Deployments → Select latest → Redeploy
```

### 5. Test It Works
```
Visit your site
Click on /quote → should load
Check /admin → should require login
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] **Database URL** - Using strong password? Check with Neon
- [ ] **API Keys** - Never share or commit these
- [ ] **Superadmin Password** - Using very strong password (20+ characters)?
- [ ] **Firebase Key** - Restricted to your domain?
- [ ] **Email Service** - Using from@yourdomain.com (branded)?
- [ ] **HTTPS** - Vercel auto-provides, verify it works
- [ ] **Environment Variables** - Only sensitive ones set to "Production"
- [ ] **Secrets** - Never logged or exposed in error messages

---

## ✅ Validation Checklist

After setting all variables:

- [ ] App builds without errors
- [ ] Home page loads
- [ ] Quote request page (/quote) loads
- [ ] Admin login works (/admin/login)
- [ ] Can create a test order
- [ ] Can request a test quote
- [ ] Emails send (check inbox)
- [ ] No console errors in browser dev tools

---

## 🆘 Troubleshooting

### "DATABASE_URL is not set"
```
✅ Fix: Add DATABASE_URL to Vercel environment variables
✅ Verify: Check exact spelling and value
```

### "Failed to connect to database"
```
✅ Fix: Ensure DATABASE_URL is correct
✅ Check: Neon allows Vercel IP access
✅ Verify: SSL mode is set to 'require'
```

### "Email not sending"
```
✅ Fix: Verify RESEND_API_KEY is correct
✅ Check: RESEND_FROM_EMAIL is set
✅ Verify: Email address is verified in Resend
```

### "Firebase error"
```
✅ Fix: Verify FIREBASE_PROJECT_ID matches Firebase console
✅ Check: All Firebase variables are correct
✅ Ensure: Private key has newlines preserved
```

### "WhatsApp not working"
```
✅ Fix: Verify TWILIO_ACCOUNT_SID and AUTH_TOKEN
✅ Check: TWILIO_PHONE_NUMBER is correct format
✅ Ensure: WhatsApp sandbox is activated in Twilio
```

---

## 📞 Where to Get Each Service

| Service | Website | Purpose |
|---------|---------|---------|
| **Neon** | https://neon.tech | PostgreSQL Database |
| **Resend** | https://resend.com | Email Service |
| **Firebase** | https://firebase.google.com | Authentication |
| **Twilio** | https://twilio.com | WhatsApp & SMS |
| **WeChat** | https://mp.weixin.qq.com | WeChat Messages |
| **Vercel** | https://vercel.com | Hosting |

---

## 🚀 Recommended Setup Order

1. **First**: Set up Neon database → Get DATABASE_URL
2. **Second**: Set up Firebase → Get all FIREBASE_* variables
3. **Third**: Set up Resend → Get RESEND_API_KEY
4. **Fourth**: Set shop branding → Set NEXT_PUBLIC_* variables
5. **Fifth**: Set superadmin credentials → SUPER_ADMIN_USERNAME/PASSWORD
6. **Optional**: Set up Twilio → WhatsApp/SMS (can add later)
7. **Optional**: Set up WeChat → Can add later for Chinese market

---

## 💡 Pro Tips

### Tip 1: Use Environment Variable Manager
```
Copy the complete list above into a text file
Check off each one as you add it to Vercel
```

### Tip 2: Test Locally First
```
Create .env.local file
Add all variables there
Run: npm run dev
Test everything works
Then add to Vercel
```

### Tip 3: Backup Your Variables
```
After adding to Vercel:
Screenshot the list
Store securely (1Password, Bitwarden, etc)
Never share or commit
```

### Tip 4: Use Different Values Per Environment
```
Production: Real database, real email
Staging: Test database, test email
Development: Local database, local email
```

---

## 📋 Verification Commands

After deployment, verify everything:

```bash
# Check database connection
curl https://your-domain.com/api/health-check

# Check email service (will send test email)
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"test@example.com","message":"Test"}'

# Check admin access
curl https://your-domain.com/admin/login
```

---

## 🎉 You're Ready!

Once all variables are set in Vercel and deployment succeeds:

✅ Database is working  
✅ Email is sending  
✅ Authentication is set up  
✅ Shop branding is applied  
✅ Ready for production  

---

**Questions?** Check the individual service documentation:
- Neon: https://neon.tech/docs
- Resend: https://resend.com/docs
- Firebase: https://firebase.google.com/docs
- Twilio: https://twilio.com/docs
- Vercel: https://vercel.com/docs

