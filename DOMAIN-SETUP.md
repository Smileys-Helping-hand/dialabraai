# Domain Configuration Guide for Dial-A-Braai

## ✅ Your Domain: dialabraai.co.za

This guide will help you configure your new domain with Firebase and ensure all functions work properly.

## 🔧 1. Firebase Console Configuration

### Add Your Domain to Firebase Hosting (if using Firebase Hosting)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dialabraai-78714`
3. Navigate to **Hosting** → **Add custom domain**
4. Enter: `dialabraai.co.za` and `www.dialabraai.co.za`
5. Follow the DNS verification steps

### Configure Authorized Domains for Authentication
1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `dialabraai.co.za`
   - `www.dialabraai.co.za`
   - `localhost` (for local development)
   - `dialabraai-78714.firebaseapp.com` (default Firebase domain)

## 🌐 2. DNS Configuration

### If Hosting on Vercel (Recommended for Next.js)
1. Go to your domain registrar (e.g., GoDaddy, Namecheap)
2. Add these DNS records:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

3. In Vercel Dashboard:
   - Go to your project settings
   - Click **Domains**
   - Add `dialabraai.co.za` and `www.dialabraai.co.za`
   - Vercel will auto-configure SSL certificates

### If Hosting on Firebase Hosting
1. Firebase will provide you with TXT records for verification
2. Add the TXT records to your DNS settings
3. After verification, Firebase will provide A records
4. Add those A records to your DNS

## 🔒 3. Update Firestore Security Rules

Your current rules allow public reads for menu and authenticated writes for orders. Make sure they're deployed:

```bash
firebase deploy --only firestore:rules
```

Current rules location: `firestore.rules`

## 📝 4. Update Environment Variables (for Vercel)

If deploying to Vercel, add these environment variables in your Vercel dashboard:

### Public Variables (Client Side):
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDL7pjQ2QKOsiMASKa-Lta2BYnUOnnOJtk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dialabraai-78714.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dialabraai-78714
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dialabraai-78714.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=102296308816
NEXT_PUBLIC_FIREBASE_APP_ID=1:102296308816:web:2bd977d065cc40feb81555
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-QN56E4L9DR
```

### Secret Variables (Server Side):
```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@dialabraai-78714.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrYQfZ3YS3xkPP
XdoAjENBmmKhqj3Mq+j1+GRXFYcn7lp/5PB/ZrQgJHW24JtEZAK0u6TlwDe9kf97
WuJUrRF9nHjFTndbW1w8igCQd7438rJgX29fNhZ9jzLPaqersHRMZCoHuoZq6eaf
vRf2zPFkavIDvsr04CV4W730NyyLu691O8txMrm5fQTHvvOvzI3tVqoxl7bVSduo
UagBeHeEBpmpG/AqU4ry/DcFyhLJ9YPg6QaqhM+K4/K8SKt9/DmyhRBoDy+W3oY8
MhFEb1mCgn+ejp8Jpvv/ReRyi4C2i+3Qqt2jq9mjw41s3sfb11aj0b4ZWr/pZfib
Qad6CZuNAgMBAAECggEABg2VjCejkCUf0INxV3scxgSorqqXZ7L7tbJaAuxm+21T
A3jn2KwdORRolva8bTA2G0GUa6v8HAU715TIcTKyrzPXXSquEws5SQcbyX59OLco
/zfntF5x8WndIs/Sz8DZ/re7901qgXy08VfpsIUhEomndiPnQbpoAGYHIcjQGThP
K6oWzmvuTA6hIWaQhQpKfSItyyFbWfzvp0xXuoOaVTWchSLUFePGeLFwTYoB8FqC
1F+C5PnHja8F0Kv+PuNT1EK3CHfZjmA4V7fp1YYZBmkKH7HaWrTgAt9WYf9waqe3
d043No8Nog2Ftu2DpCTQt7oQ7Kb2k4PT9ym+HhGU2QKBgQDs/NameEh8n843sQUL
VPlKUVZwvmPwbKNGuK12YUyjytTweGal/ma9jQ85mz49VTwG/6VK4shXpfmyc/8U
LoUcTNFUtWCodVxBrJp3LdODr/9SPm82Z+vHJyUaRarsVxPC4cxXpxmG1ldTFYKL
xzbld3zuf8aP/RcBCYMlkpGKSQKBgQC5IL9WhIrv0sWXMq9o8An6UiHooEfgsTl9
4PXWdLLFHjN87MOkgO7H3zQFIfYlUitMLPT10QHH1LRWDE+Sgz5M3EhlVKIxna01
uGavd78U/7YFAo/Svb3kVNAqVAww8ACg74NAsjHO2crP+2AK51Cw0OSfha8lqvUV
Q9y5Y3OnJQKBgFIEOuFH9YYz5DF/8Qf384KV3b2NFpdJccRy+41hpR12f/VtJdFC
1xm4rNE5+fNOAUVGylS9Yap7xYvN+zRn2SdvKm8PipEidLhB3P9r+6yyh0FWXDTP
CFlXIc8S11GN3Ufvz0FykjIJEhWt9w0a99O4Y6NC01xXsdNpEFs7e2UJAoGBAJmr
FSg73Rg1XM6kw/XXSnD+vCbc5M0eTxquIWJifAIjj5mi7sMeQxalsAiSqD9SdZ5F
sxBY7aFybj7++Q4k4xHpyC5Ukk2dFKoC5zm/rF1B5VVDSx8jYPynaiO4oGX+0obE
Sa7qO234WuFJR+/FErWysBO6ZChgQA/mxNEePGIBAoGALIFYBtZF1pcZrSdBQHIW
pFtfhdS6BFoaWZXPOopl75QYtGYofVWZXFtW3sFCUE1nM3xEUks59I9ygE/vJqwj
Wn7dlA/k556ixwgPB4PUHtDdWcW9j0zwwmChA+MS1pDwk8UTkQ2997AkY8ZsaAR6
9/JNKnvW9U91Lx2lHQ83z8o=
-----END PRIVATE KEY-----"
```

**Important**: For Vercel, use the format key **without** escaping newlines. The private key should be pasted as-is with actual line breaks.

## 🧪 5. Test Your Firebase Connection

Run this command to verify everything is working:

```bash
node test-firebase.js
```

Expected output:
```
✅ Firebase Admin SDK initialized successfully
✅ Firestore instance created
✅ Successfully read from 'menu' collection
✅ Successfully created test document
🎉 All Firebase tests passed!
```

## 🚀 6. Deploy Your Application

### Option A: Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Deploy to Firebase Hosting
```bash
# Build your Next.js app for static export
npm run build
npm run export

# Deploy to Firebase
firebase deploy --only hosting
```

## 📱 7. Update Mobile App Configuration

If you have a mobile app, update the Capacitor configuration in `capacitor.config.ts`:

```typescript
server: {
  androidScheme: 'https',
  hostname: 'dialabraai.co.za',
  allowNavigation: ['*'],
},
```

## ✅ 8. Verify Everything Works

After deployment, test these URLs:

1. **Homepage**: https://dialabraai.co.za
2. **Menu**: https://dialabraai.co.za/menu
3. **Admin Dashboard**: https://dialabraai.co.za/admin/dashboard
4. **Health Check**: https://dialabraai.co.za/api/health-check
5. **Menu API**: https://dialabraai.co.za/api/menu/list

## 🔍 Troubleshooting

### Items Not Persisting
- ✅ **FIXED**: Updated admin panel to properly refresh after adding/deleting items
- Firebase is working correctly (verified via test script)
- Items are saved to Firestore successfully

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase Console for billing/quota limits
- Ensure Firestore database is created and in the correct region
- Check firestore.rules are deployed

### Domain Not Resolving
- DNS changes can take 24-48 hours to propagate
- Use `nslookup dialabraai.co.za` to check DNS
- Clear browser cache and try incognito mode

## 📞 Need Help?

1. Check Firebase Console for error logs
2. Check browser console for client-side errors
3. Check Vercel logs for server-side errors
4. Test API endpoints directly using the health check

## 🎉 Success Checklist

- [ ] Domain added to Firebase Console
- [ ] DNS records configured at registrar
- [ ] Environment variables set in deployment platform
- [ ] Firestore rules deployed
- [ ] Application deployed and accessible
- [ ] Menu items persist after adding
- [ ] Orders can be created
- [ ] Admin panel works correctly
- [ ] SSL certificate active (https://)
