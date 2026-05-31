# Deployment Guide — Vercel Production

## Prerequisites

- Vercel account (vercel.com)
- Neon PostgreSQL database
- Resend API key for emails
- Firebase project (for shop owner auth)

## Steps to Deploy

### 1. Set Up Environment Variables

Copy `.env.example` to your local `.env.local` and fill in real values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `RESEND_API_KEY` — From resend.com dashboard
- `SUPER_ADMIN_USERNAME` — Change from default!
- `SUPER_ADMIN_PASSWORD` — Change from default!
- Firebase credentials

### 2. Test Locally

```bash
npm install
npm run dev

# Visit http://localhost:3000
# Test superadmin: http://localhost:3000/superadmin/login
```

### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to vercel.com
2. Import your GitHub repository
3. Vercel auto-detects Next.js
4. Add environment variables:
   - `DATABASE_URL`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `SUPER_ADMIN_USERNAME` (strong password!)
   - `SUPER_ADMIN_PASSWORD` (strong password!)
   - Firebase env vars
5. Deploy

**Option B: Via CLI**
```bash
npm install -g vercel
vercel --prod

# Follow prompts to connect GitHub repo and add env vars
```

### 4. Verify Deployment

After deploy:
- ✅ Visit your deployment URL
- ✅ Test superadmin login at `/superadmin/login`
- ✅ Generate an API key at `/superadmin/developer`
- ✅ Test API: `curl -H "Authorization: Bearer graze_live_XXX" https://yourapp.com/api/v1/health`

## Production Checklist

- [ ] Change `SUPER_ADMIN_USERNAME` and `SUPER_ADMIN_PASSWORD` from defaults
- [ ] Set `DATABASE_URL` to production Neon database
- [ ] Verify Resend API key works
- [ ] Test email delivery
- [ ] Run migrations on first deploy: Visit `/api/shops/bootstrap` or create a shop
- [ ] Monitor logs at `/superadmin/logs`
- [ ] Test webhook dispatch (register a webhook at `/superadmin/developer`)
- [ ] Verify API endpoints with Bearer auth

## Database Migrations

Migrations run automatically when:
1. A shop is created via `/api/shops/bootstrap`
2. You can manually trigger via Neon SQL console if needed

To manually run:
```sql
-- Run against your Neon database to create API & Developer Hub tables
CREATE TABLE IF NOT EXISTS registered_apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'owned',
  description TEXT DEFAULT '',
  owner_email TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ... (see lib/migrations.js for full schema)
```

## Monitoring

- **API Logs**: `/superadmin/logs` (auto-refresh, filterable)
- **App Health**: `/superadmin/developer` > Health tab
- **Webhooks**: `/superadmin/developer` > Webhooks tab
- **Ad Campaigns**: `/superadmin/ads`

## Troubleshooting

**"Database connection error"**
- Verify `DATABASE_URL` is set in Vercel environment variables
- Check Neon connection status

**"Superadmin login fails"**
- Verify `SUPER_ADMIN_USERNAME` and `SUPER_ADMIN_PASSWORD` are set
- Ensure no typos in credentials

**"Webhook dispatch failing"**
- Check webhook URL is accessible from internet
- Verify HTTPS (required)
- Check Vercel function timeout (set to 60s in vercel.json)

**"API keys not working"**
- Ensure `DATABASE_URL` can connect to database
- Verify API key format: `graze_live_...`

## Support

For issues, check:
- Vercel deployment logs: `vercel logs`
- Application logs: `/superadmin/logs` (live viewer)
- Database status: Neon console

