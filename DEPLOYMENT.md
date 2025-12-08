# Dial-A-Braai - Firebase Production Deployment Guide

## Overview
This Next.js application now uses Firebase for authentication, Firestore for database, and is ready for production deployment.

## Prerequisites
- Node.js 18+ installed
- Firebase account and project created
- Firebase CLI installed: `npm install -g firebase-tools`

## 1. Firebase Project Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database (in "Build" section)
4. Enable Authentication with Email/Password provider
5. (Optional) Enable Firebase Storage if you plan to upload menu images

### Get Firebase Config
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Copy the Firebase config object

### Get Service Account Key
1. In Firebase Console, go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely (NEVER commit to Git)

## 2. Environment Variables Setup

Create `.env.local` in the project root:

```env
# Firebase Client Config (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (from service account JSON)
# Option 1: Individual fields (easier for development)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour-Private-Key-Here\\n-----END PRIVATE KEY-----\\n"

# Option 2: Full service account JSON (recommended for production)
# FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Important:** 
- Replace all placeholders with your actual Firebase values
- The private key must include escaped newlines (`\\n`)
- Never commit `.env.local` to version control

## 3. Firestore Database Setup

### Deploy Firestore Rules & Indexes
```powershell
firebase login
firebase init firestore
# Select your Firebase project
# Use existing firestore.rules and firestore.indexes.json

firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Create Initial Collections
The app requires two Firestore collections:

**`menu` collection:**
- Fields: `name` (string), `description` (string), `price` (number), `category` (string), `image_url` (string), `created_at` (string)

**`orders` collection:**
- Fields: `customer_name` (string), `customer_phone` (string), `items` (array), `total_price` (number), `status` (string), `paid` (boolean), `notes` (string), `created_at` (string)

You can add sample data via Firebase Console or use the admin panel after deployment.

## 4. Create Admin User

### Via Firebase Console
1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Save the credentials for admin login

### Via Firebase CLI (Alternative)
```powershell
firebase auth:import users.json --project your-project-id
```

Create `users.json`:
```json
{
  "users": [
    {
      "email": "admin@dialabraai.co.za",
      "passwordHash": "your-hashed-password",
      "emailVerified": true
    }
  ]
}
```

## 5. Local Development

```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

**Test the app:**
- Menu page: http://localhost:3000/menu
- Admin login: http://localhost:3000/admin/login
- Order page: http://localhost:3000/order

## 6. Production Deployment Options

### Option A: Vercel (Recommended for Next.js)

1. Install Vercel CLI:
```powershell
npm install -g vercel
```

2. Deploy:
```powershell
vercel
```

3. Add environment variables in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` and `FIREBASE_*` variables
   - Redeploy

**Vercel Deployment URL:** Your app will be at `https://your-app.vercel.app`

### Option B: Firebase Hosting

1. Build the app for static export:
```powershell
npm run build
```

2. Initialize Firebase Hosting:
```powershell
firebase init hosting
# Select: Use an existing project
# Public directory: out
# Configure as single-page app: Yes
# Overwrite index.html: No
```

3. Deploy:
```powershell
firebase deploy --only hosting
```

**Note:** Firebase Hosting works best with static exports. For full Next.js features (API routes, SSR), use Vercel or a Node.js server.

### Option C: Docker + Cloud Run / Azure / AWS

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. Build and push:
```powershell
docker build -t dialabraai .
docker tag dialabraai gcr.io/your-project-id/dialabraai
docker push gcr.io/your-project-id/dialabraai
```

3. Deploy to Cloud Run / Azure Container Instances / ECS

## 7. Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test admin login at `/admin/login`
- [ ] Test creating orders at `/order`
- [ ] Verify menu displays correctly at `/menu`
- [ ] Check Firestore rules are deployed
- [ ] Monitor Firebase Console for errors
- [ ] Set up Firebase Analytics (optional)
- [ ] Configure custom domain (optional)
- [ ] Enable Firebase Performance Monitoring (optional)

## 8. Firestore Security Best Practices

Current rules allow:
- Anyone can read menu items
- Anyone can create orders (for customer orders)
- Only authenticated users can read/update/delete orders (for admin panel)

**For production, consider:**
- Adding rate limiting
- Validating data on write
- Adding role-based access control (RBAC)
- Implementing Cloud Functions for complex business logic

## 9. Monitoring & Maintenance

### Firebase Console Monitoring
- Check Authentication → Users for admin accounts
- Monitor Firestore → Data for database contents
- Review Usage & Billing to track costs

### Application Logs
- Vercel: Check deployment logs in dashboard
- Firebase Functions: Use Firebase Console → Functions → Logs
- Local: Check terminal output during `npm run dev`

## 10. Troubleshooting

### "Firebase is not configured" Error
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check browser console for detailed errors
- Ensure environment variables are loaded (restart dev server)

### "Permission denied" in Firestore
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Verify user is authenticated for admin operations
- Check Firebase Console → Firestore → Rules

### Admin login fails
- Verify user exists in Firebase Authentication
- Check that `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are correct
- Ensure Firebase Auth Email/Password provider is enabled

### Orders/Menu not showing
- Check Firestore collections exist with correct names (`menu`, `orders`)
- Verify Firestore indexes are deployed
- Check browser Network tab for API errors

## Support

For Firebase-specific issues, consult:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)

## License

Proprietary - Dial-A-Braai © 2025
