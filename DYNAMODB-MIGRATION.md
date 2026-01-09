# DynamoDB Migration Guide

This guide will help you migrate from Firebase/Firestore to AWS DynamoDB for the Dialabraai food ordering application.

## Overview

Your application has been updated to use Amazon DynamoDB instead of Firebase/Firestore. DynamoDB offers:
- Better scalability for high-traffic scenarios
- Seamless AWS integration
- Lower costs at scale
- Single-digit millisecond latency
- Serverless architecture with zero maintenance

## Prerequisites

1. **AWS Account** - Create an account at [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI** - Install from [aws.amazon.com/cli](https://aws.amazon.com/cli/)
3. **AWS Credentials** - Create an IAM user with DynamoDB permissions

## Step 1: Configure AWS Credentials

### Option A: IAM User (Recommended for development)

1. Go to AWS Console → IAM → Users → Create User
2. Attach policy: `AmazonDynamoDBFullAccess`
3. Create access keys
4. Save your credentials:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### Option B: IAM Role (Recommended for production)

If deploying to AWS Lambda, EC2, or ECS, use IAM roles instead of access keys.

## Step 2: Set Environment Variables

Add these to your `.env.local` (development) or hosting platform:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# DynamoDB Table Names (optional - defaults shown)
DYNAMODB_ORDERS_TABLE=dialabraai-orders
DYNAMODB_MENU_TABLE=dialabraai-menu
DYNAMODB_USERS_TABLE=dialabraai-users
DYNAMODB_PACKS_TABLE=dialabraai-packs
```

## Step 3: Create DynamoDB Tables

Run the setup script to create all required tables:

```bash
npm install
node scripts/setup-dynamodb-tables.js
```

This creates:
- **dialabraai-orders** - Stores customer orders
- **dialabraai-menu** - Stores menu items
- **dialabraai-users** - Stores user accounts
- **dialabraai-packs** - Stores order packs/combos

## Step 4: Migrate Data (Optional)

If you have existing data in Firestore, you'll need to migrate it to DynamoDB.

### Export from Firestore

```javascript
// scripts/export-firestore.js
import { adminDb } from '../lib/firebase-admin.js';
import fs from 'fs';

async function exportCollection(collectionName) {
  const snapshot = await adminDb.collection(collectionName).get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  fs.writeFileSync(`${collectionName}.json`, JSON.stringify(data, null, 2));
  console.log(`✅ Exported ${data.length} items from ${collectionName}`);
}

await exportCollection('orders');
await exportCollection('menu');
await exportCollection('users');
```

### Import to DynamoDB

```javascript
// scripts/import-to-dynamodb.js
import { docClient, TABLES, createItem } from '../lib/dynamodb.js';
import fs from 'fs';

async function importCollection(tableName, fileName) {
  const data = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  
  for (const item of data) {
    await createItem(tableName, item);
    console.log(`✅ Imported item ${item.id}`);
  }
  
  console.log(`✅ Imported ${data.length} items to ${tableName}`);
}

await importCollection(TABLES.ORDERS, 'orders.json');
await importCollection(TABLES.MENU, 'menu.json');
await importCollection(TABLES.USERS, 'users.json');
```

## Step 5: Test the Migration

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Test the following:
   - ✅ View menu items
   - ✅ Create an order
   - ✅ View order details
   - ✅ Update order status (admin)
   - ✅ View admin dashboard stats

## Step 6: Deploy

### Vercel Deployment

1. Add environment variables in Vercel Dashboard:
   - Settings → Environment Variables
   - Add all AWS variables listed in Step 2

2. Deploy:
   ```bash
   vercel --prod
   ```

### AWS Amplify Deployment

1. Connect your repository in Amplify Console
2. Add environment variables in Build Settings
3. Deploy automatically on git push

### Other Platforms

Ensure you set the AWS environment variables in your hosting platform's settings.

## Data Structure Comparison

### Firestore → DynamoDB Mapping

| Firestore | DynamoDB | Notes |
|-----------|----------|-------|
| Collection | Table | Both store groups of items |
| Document ID | Primary Key (id) | Auto-generated unique ID |
| Document | Item | JSON-like structure |
| Subcollections | Separate tables | Flatten hierarchies |
| `.doc(id).get()` | `getItem(table, {id})` | Get single item |
| `.collection().get()` | `scanTable(table)` | Get all items |
| `.doc(id).update()` | `updateItem(table, {id}, updates)` | Update fields |

## Code Changes Summary

All Firebase/Firestore imports have been replaced:

**Before:**
```javascript
import { adminDb } from '@/lib/firebase-admin';
const snapshot = await adminDb.collection('orders').get();
```

**After:**
```javascript
import { docClient, TABLES, scanTable } from '@/lib/dynamodb';
const orders = await scanTable(TABLES.ORDERS);
```

## Billing & Costs

### DynamoDB Pricing

- **Free Tier**: 25 GB storage + 25 WCU/RCU per month forever
- **On-Demand Mode** (current setting):
  - $1.25 per million write requests
  - $0.25 per million read requests
  - $0.25 per GB storage per month

### Example Costs

For a restaurant with:
- 100 orders/day = 3,000/month → $0.004
- 1,000 menu views/day = 30,000/month → $0.008
- Total storage: < 1 GB → $0.25

**Estimated monthly cost: < $1** for most small-medium businesses

## Troubleshooting

### Issue: "DynamoDB not configured" error

**Solution:** Check that AWS environment variables are set correctly:
```bash
echo $AWS_REGION
echo $AWS_ACCESS_KEY_ID
```

### Issue: "ResourceNotFoundException"

**Solution:** Tables don't exist. Run the setup script:
```bash
node scripts/setup-dynamodb-tables.js
```

### Issue: "Access Denied" errors

**Solution:** IAM user needs DynamoDB permissions. Attach `AmazonDynamoDBFullAccess` policy.

### Issue: Items not showing up

**Solution:** Check table names match environment variables:
```javascript
console.log(TABLES); // Should output correct table names
```

## Rolling Back to Firebase

If you need to revert, the Firebase code is still present. Simply:

1. Remove AWS environment variables
2. Add Firebase environment variables back
3. The app will automatically fall back to Firebase

## Performance Optimization

### Use Query Instead of Scan

For large tables, use `queryItems()` with indexes:

```javascript
// Instead of scanning all orders
const orders = await scanTable(TABLES.ORDERS);

// Query by date (requires GSI)
const recentOrders = await queryItems(
  TABLES.ORDERS,
  'created_at > :date',
  { ':date': '2026-01-01' },
  'created_at-index'
);
```

### Enable Caching

Use DAX (DynamoDB Accelerator) for microsecond latency on reads.

## Next Steps

1. ✅ Remove Firebase dependencies (optional):
   ```bash
   npm uninstall firebase firebase-admin
   ```

2. ✅ Set up CloudWatch alarms for monitoring

3. ✅ Enable DynamoDB backups for production

4. ✅ Consider using DynamoDB Streams for real-time features

## Support

- **AWS Documentation**: [docs.aws.amazon.com/dynamodb](https://docs.aws.amazon.com/dynamodb)
- **DynamoDB Best Practices**: [AWS DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

---

**Migration Status**: ✅ Complete

All API routes have been updated to use DynamoDB. Your application will work seamlessly with the new database once tables are created and environment variables are configured.
