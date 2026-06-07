# Vercel Environment Variables - Quick Reference Card

**Print this or keep it open while setting up Vercel!**

---

## 🔴 ABSOLUTELY REQUIRED (Copy These!)

```
DATABASE_URL=postgresql://user:password@host.eu-west-2.aws.neon.tech/dbname?sslmode=require&channel_binding=require
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=Your$Tr0ng!P@ssw0rd123
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

| Variable | Where to Get | Priority |
|----------|--------------|----------|
| DATABASE_URL | https://neon.tech → Project settings | 🔴 Critical |
| RESEND_API_KEY | https://resend.com → API Keys | 🔴 Critical |
| RESEND_FROM_EMAIL | Your email (e.g., noreply@yourdomain.com) | 🔴 Critical |
| SUPER_ADMIN_USERNAME | Create your own (e.g., admin) | 🔴 Critical |
| SUPER_ADMIN_PASSWORD | Create strong password (20+ chars) | 🔴 Critical |
| Firebase Variables | https://console.firebase.google.com → Settings | 🔴 Critical |

---

## 🟡 HIGHLY RECOMMENDED

```
NEXT_PUBLIC_WHATSAPP_NUMBER=27837864913
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
NEXT_PUBLIC_WECHAT_ID=your_wechat_id
WECHAT_ACCESS_TOKEN=your_token
```

| Variable | Where to Get | When |
|----------|--------------|------|
| TWILIO_ACCOUNT_SID | https://twilio.com → Account | For WhatsApp |
| TWILIO_AUTH_TOKEN | https://twilio.com → Account | For WhatsApp |
| WECHAT_ACCESS_TOKEN | https://mp.weixin.qq.com | Optional |

---

## 🟢 SHOP BRANDING (Customize!)

```
NEXT_PUBLIC_SHOP_NAME=Your Shop Name
NEXT_PUBLIC_SHOP_SHORT_NAME=ShopShort
NEXT_PUBLIC_SHOP_DESCRIPTION=Your shop description
NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY=+27 81 234 5678
NEXT_PUBLIC_SUPPORT_PHONE_DIAL=0812345678
NEXT_PUBLIC_SUPPORT_EMAIL=hello@yourshop.com
NEXT_PUBLIC_PRIMARY_COLOR=#762C1B
NEXT_PUBLIC_ACCENT_COLOR=#E46A28
NEXT_PUBLIC_CURRENCY_SYMBOL=R
NEXT_PUBLIC_ESTIMATED_READY_TIME=30-45 minutes
NEXT_PUBLIC_OPERATING_HOURS=08:00-22:00
NEXT_PUBLIC_PAYMENT_METHODS=Cash, EFT, Card
NEXT_PUBLIC_DEFAULT_MENU_CATEGORIES=Featured,Meals,Drinks,Desserts
NEXT_PUBLIC_APP_NAME=Graze
NEXT_PUBLIC_APP_TYPE=owned
```

---

## ✅ Verification Checklist

After adding all variables to Vercel:

- [ ] Redeploy the application
- [ ] Home page loads (https://your-domain.com)
- [ ] Quote page loads (https://your-domain.com/quote)
- [ ] Admin login works (https://your-domain.com/admin/login)
- [ ] Can submit a test order
- [ ] Can request a test quote
- [ ] Test email received
- [ ] No errors in browser console

---

## 🎯 Copy-Paste for Vercel Dashboard

### Step 1: Go To
```
https://vercel.com/dashboard
```

### Step 2: Select Project
```
Click on your dialabraai project
```

### Step 3: Go To Settings
```
Click Settings → Environment Variables
```

### Step 4: Add Each Variable
For each variable:
1. Click "Add New"
2. Name: (exact spelling from above)
3. Value: (your actual value)
4. Production + Preview + Development
5. Click "Add"

### Step 5: Redeploy
```
Deployments → Latest → Redeploy
```

---

## 🚨 Common Mistakes (Avoid These!)

| Mistake | Problem | Solution |
|---------|---------|----------|
| Typo in variable name | App won't find it | Copy exactly as shown |
| Missing DATABASE_URL | Database won't connect | Get from Neon |
| Weak superadmin password | Security risk | Use 20+ chars with symbols |
| Firebase key exposed | Credentials stolen | Never share, only in Vercel |
| Email address wrong format | Emails won't send | Use proper email format |
| Forgot RESEND_API_KEY | Email feature breaks | Add to Vercel |

---

## 📞 Need Help Finding Your Values?

### Neon Database
```
1. Go to https://neon.tech
2. Log in
3. Click Project
4. Connection String → Copy full URL
5. Paste as DATABASE_URL
```

### Resend Email
```
1. Go to https://resend.com
2. API Keys
3. Copy your API key → RESEND_API_KEY
4. Use your email as FROM_EMAIL
```

### Firebase
```
1. Go to https://console.firebase.google.com
2. Project Settings
3. General tab
4. Scroll down → Web API Configuration
5. Copy all values
6. Service Accounts tab → Private key for FIREBASE_PRIVATE_KEY
```

### Twilio (WhatsApp)
```
1. Go to https://twilio.com
2. Console
3. Account SID → TWILIO_ACCOUNT_SID
4. Auth Token → TWILIO_AUTH_TOKEN
5. WhatsApp sandbox → Phone number → NEXT_PUBLIC_WHATSAPP_NUMBER
```

---

## 💾 Save This Information

Once you have all values:

1. **Don't commit** to GitHub
2. **Don't email** to anyone
3. **Save securely** in password manager (1Password, Bitwarden)
4. **Screenshot** the Vercel settings page
5. **Keep backup** in secure location

---

## 🎉 Once Everything is Set Up

You can:

✅ Create orders  
✅ Request quotes  
✅ Confirm payments manually  
✅ Send notifications  
✅ Manage admin dashboard  
✅ Track everything  

---

## 📱 Quick Test After Deployment

```
1. Visit: https://your-domain.com
2. Click: "Request Quote"
3. Add: Some items
4. Submit: Quote request
5. Check: Email inbox
6. Admin: /admin/login (use credentials you set)
```

---

## 🆘 Something Not Working?

**Check in order:**

1. ✓ Variable name spelled exactly right?
2. ✓ Redeployed after adding variables?
3. ✓ Check Vercel Logs: Deployments → Build Logs
4. ✓ Check Browser Console: F12 → Console tab
5. ✓ Test with local .env.local first

---

**Print me or bookmark me! 🔖**

