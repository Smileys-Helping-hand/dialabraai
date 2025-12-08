# Firebase Production Setup Checklist

## ✅ Completed Migration Tasks

- [x] Installed Firebase and Firebase Admin SDK
- [x] Created Firebase client configuration (`lib/firebase.js`)
- [x] Created Firebase Admin configuration (`lib/firebase-admin.js`)
- [x] Migrated all API routes from Supabase to Firestore
- [x] Updated authentication from Supabase Auth to Firebase Auth
- [x] Removed Supabase realtime subscriptions (replaced with polling)
- [x] Updated environment variable configuration
- [x] Created production configs (`next.config.js`, `firebase.json`)
- [x] Added Firestore security rules (`firestore.rules`)
- [x] Added Firestore indexes (`firestore.indexes.json`)
- [x] Created comprehensive deployment guide (`DEPLOYMENT.md`)
- [x] Updated README with new tech stack
- [x] Build verified successfully

## 🚀 Next Steps for Production Deployment

### 1. Firebase Project Setup
- [ ] Create Firebase project at https://console.firebase.google.com/
- [ ] Enable Firestore Database
- [ ] Enable Authentication (Email/Password provider)
- [ ] (Optional) Enable Firebase Storage for menu images
- [ ] Get Firebase config (Project Settings > General > Your apps)
- [ ] Generate service account key (Project Settings > Service Accounts)

### 2. Environment Configuration
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add all Firebase credentials to `.env.local`
- [ ] Verify `NEXT_PUBLIC_FIREBASE_*` variables are set
- [ ] Verify `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are set

### 3. Firestore Setup
```powershell
firebase login
firebase init firestore
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 4. Create Admin User
- [ ] Go to Firebase Console → Authentication → Users
- [ ] Click "Add user" and create admin account
- [ ] Save credentials for admin login at `/admin/login`

### 5. Add Sample Data (Optional)
- [ ] Add menu items via Firebase Console or admin panel
- [ ] Verify menu displays at `/menu`

### 6. Local Testing
```powershell
npm install
npm run dev
# Test at http://localhost:3000
```

- [ ] Test menu page (`/menu`)
- [ ] Test order page (`/order`)
- [ ] Test admin login (`/admin/login`)
- [ ] Test admin dashboard (`/admin/orders`)

### 7. Deploy to Production
Choose one:

**Option A: Vercel (Recommended)**
```powershell
npm install -g vercel
vercel
# Add environment variables in Vercel dashboard
```

**Option B: Firebase Hosting**
```powershell
npm run build
firebase deploy --only hosting
```

### 8. Post-Deployment
- [ ] Verify production URL works
- [ ] Test all features in production
- [ ] Set up custom domain (optional)
- [ ] Enable Firebase Analytics (optional)
- [ ] Monitor Firebase Console for errors

## 📝 Important Notes

### Database Collections
- `menu` - Menu items (name, price, category, description, image_url, created_at)
- `orders` - Customer orders (customer_name, customer_phone, items, total_price, status, paid, created_at)

### API Endpoints
- `GET /api/menu/list` - List all menu items
- `POST /api/menu/add` - Add menu item (admin)
- `POST /api/menu/update` - Update/delete menu item (admin)
- `POST /api/orders/create` - Create order
- `GET /api/orders/list` - List all orders (admin)
- `GET /api/orders/get?id=` - Get order by ID
- `POST /api/orders/update-status` - Update order status (admin)
- `POST /api/orders/mark-paid` - Mark order as paid (admin)
- `POST /api/orders/delete` - Delete order (admin)
- `GET /api/admin/stats` - Get admin statistics (admin)

### Security
- Firestore rules allow public menu reads and order creates
- Admin operations require Firebase Authentication
- Service account credentials should NEVER be committed to Git
- Use environment variables for all sensitive data

## 🐛 Troubleshooting

### Build succeeds but app doesn't work
- Verify all environment variables are set correctly
- Check Firebase Console for authentication errors
- Check browser console for client-side errors

### "Firebase is not configured" errors
- Ensure `.env.local` exists with valid credentials
- Restart dev server after adding environment variables
- Verify Firebase project is active in Firebase Console

### Orders/Menu not showing
- Verify Firestore collections exist (`menu`, `orders`)
- Deploy Firestore rules and indexes
- Check Firebase Console → Firestore → Data

### Admin login fails
- Verify admin user exists in Firebase Authentication
- Check that Email/Password provider is enabled
- Verify `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are correct

## 📚 Documentation

- Full deployment guide: `DEPLOYMENT.md`
- Project README: `README.md`
- Firebase docs: https://firebase.google.com/docs
- Next.js docs: https://nextjs.org/docs

---

**Ready for production!** Follow the checklist above to deploy to Firebase and Vercel.
