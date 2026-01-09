# 🚀 Quick Start: Test Your Hybrid Email System

## Test RIGHT NOW (No AWS Setup Required!)

### Step 1: Generate Security Key

```powershell
# Run this in PowerShell:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copy the output.

### Step 2: Create `.env.local`

Create a file named `.env.local` in your project root:

```env
# Security (REQUIRED)
INTERNAL_API_KEY=paste-your-generated-key-here
NEXT_PUBLIC_INTERNAL_API_KEY=paste-your-generated-key-here

# AWS SES (Leave empty for SIMULATION MODE)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@dialabraai.com

# (Add your existing Firebase/Supabase variables here)
```

### Step 3: Check Configuration

```bash
npm run check-email
```

You should see: **🟡 SIMULATION MODE**

### Step 4: Start Your App

```bash
npm run dev
```

### Step 5: Test It!

1. Open http://localhost:3000/admin/dashboard
2. Log in (if needed)
3. Find the **"📧 Email System Status"** widget
4. Click **"🧪 Test Email System"**
5. You should see:
   - 🟡 **SIMULATION MODE** badge
   - Success message
   - Email details in your terminal console

**That's it!** Your app now works without AWS credentials.

---

## When You're Ready for Real Emails

1. **Get AWS SES Credentials** (see [EMAIL-DISPATCH-GUIDE.md](./EMAIL-DISPATCH-GUIDE.md))
2. **Update `.env.local`**:
   ```env
   AWS_ACCESS_KEY_ID=your-actual-access-key
   AWS_SECRET_ACCESS_KEY=your-actual-secret-key
   ```
3. **Restart**: `npm run dev`
4. **Test again** - Now you'll see 🟢 **REAL MODE**!

---

## Troubleshooting

**"Unauthorized" error?**
- Make sure both `INTERNAL_API_KEY` and `NEXT_PUBLIC_INTERNAL_API_KEY` are the same in `.env.local`
- Restart your dev server after changing `.env.local`

**Not seeing the Email Tester widget?**
- Clear your browser cache
- Make sure you're on `/admin/dashboard`

**Need more help?**
- Read the full guide: [EMAIL-DISPATCH-GUIDE.md](./EMAIL-DISPATCH-GUIDE.md)

---

## What Just Happened?

✅ Installed AWS SES SDK  
✅ Created hybrid dispatch API (`/app/api/dispatch/route.js`)  
✅ Added email tester widget to dashboard  
✅ Generated `.env.example` template  
✅ Created comprehensive documentation  

**Your app is now future-proof:**
- Test locally without AWS (Simulation Mode)
- Deploy to production with real emails (Real Mode)
- Zero code changes needed to switch modes!
