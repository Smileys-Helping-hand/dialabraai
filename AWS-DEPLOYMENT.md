# AWS Amplify Deployment Guide for Dial-A-Braai

## Prerequisites
- GitHub repository connected: `Smileys-Helping-hand/dialabraai`
- Domain: `hustlestudio` (for testing)
- Firebase project with credentials

## Step 1: Prepare Environment Variables

Create these environment variables in AWS Amplify Console:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Service Account)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

## Step 2: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `dialabraai-78714`
3. Click "Firestore Database" in left menu
4. Click "Create Database"
5. Choose **Production Mode** (recommended) or Test Mode
6. Select closest region (preferably Europe/Middle East for South Africa)
7. Click "Enable"

## Step 3: Deploy to AWS Amplify

### Option A: Via AWS Console (Recommended)

1. **Login to AWS Console**
   - Go to https://console.aws.amazon.com/amplify
   - Select your region (e.g., us-east-1)

2. **Connect Repository**
   - Click "New app" → "Host web app"
   - Select "GitHub"
   - Authorize AWS Amplify to access your GitHub
   - Choose repository: `Smileys-Helping-hand/dialabraai`
   - Select branch: `main`

3. **Configure Build Settings**
   AWS Amplify will auto-detect Next.js. Use this build configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

4. **Add Environment Variables**
   - In build settings, add all environment variables from Step 1
   - For `FIREBASE_PRIVATE_KEY`, paste the entire key including `\n` characters

5. **Advanced Settings**
   - Node version: `18.x` or `20.x`
   - Build image: `Amazon Linux:2023`
   
6. **Deploy**
   - Click "Save and Deploy"
   - Wait 5-10 minutes for deployment

### Option B: Via AWS CLI

```bash
# Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Initialize
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

## Step 4: Configure Custom Domain

1. **In AWS Amplify Console**
   - Go to your app
   - Click "Domain management" in left menu
   - Click "Add domain"

2. **Add hustlestudio domain**
   - Enter: `hustlestudio.com` or `dialabraai.hustlestudio.com`
   - AWS will provide DNS records

3. **Update DNS Records**
   - Go to your domain registrar (where you bought hustlestudio)
   - Add the CNAME records provided by AWS
   - Example:
     ```
     Type: CNAME
     Name: dialabraai (or @)
     Value: xxxxxx.cloudfront.net
     ```

4. **Wait for SSL Certificate**
   - AWS will automatically provision SSL certificate
   - Usually takes 5-30 minutes
   - Your site will be accessible at: `https://dialabraai.hustlestudio.com`

## Step 5: Verify Deployment

1. **Check Deployment Status**
   - In Amplify Console, view build logs
   - Ensure all steps completed successfully

2. **Test the App**
   - Visit your deployed URL
   - Test menu loading (should show demo data initially)
   - Login to admin: `https://your-url.amplifyapp.com/admin`
     - Password: `admin123`

3. **Add Menu Items**
   - Login to admin panel
   - Go to Menu tab
   - Add your actual menu items
   - Set prices in South African Rand (R)

## Step 6: Post-Deployment Checklist

- [ ] Firestore database created and enabled
- [ ] All environment variables added to Amplify
- [ ] App successfully deployed
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Admin panel accessible
- [ ] Menu items added
- [ ] Test order placement
- [ ] WhatsApp number updated (currently: 27837864913)

## Troubleshooting

### Build Failures
- Check build logs in Amplify Console
- Verify all environment variables are set correctly
- Ensure `FIREBASE_PRIVATE_KEY` has proper line breaks (`\n`)

### Firestore Errors
- Verify Firestore is enabled in Firebase Console
- Check Firestore rules allow read/write access
- Confirm service account credentials are correct

### Domain Issues
- DNS propagation can take 24-48 hours
- Use `nslookup` or `dig` to check DNS records
- Verify CNAME points to correct Amplify URL

## Important URLs

- **AWS Amplify Console**: https://console.aws.amazon.com/amplify
- **Firebase Console**: https://console.firebase.google.com/project/dialabraai-78714
- **GitHub Repository**: https://github.com/Smileys-Helping-hand/dialabraai

## Support

If you encounter issues:
1. Check AWS Amplify build logs
2. Check browser console for errors
3. Verify Firebase credentials
4. Test in demo mode first (works without Firestore)

---

**🎉 Once deployed, your admin password is: `admin123`**

**Remember to:**
- Update WhatsApp number in `app/success/page.js` if needed (currently 27837864913)
- Change admin password in production (update in `app/admin/page.js`)
- Add your actual menu items via admin panel
