// Test Firebase Configuration
require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Firebase Environment Variables Check:\n');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ SET' : '❌ MISSING');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ SET' : '❌ MISSING');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? `✅ SET (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : '❌ MISSING');

if (process.env.FIREBASE_PRIVATE_KEY) {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  console.log('\n🔑 Private Key Format Check:');
  console.log('  Has BEGIN marker:', key.includes('BEGIN PRIVATE KEY') ? '✅' : '❌');
  console.log('  Has END marker:', key.includes('END PRIVATE KEY') ? '✅' : '❌');
  console.log('  Has escaped newlines:', key.includes('\\n') ? '⚠️  YES (needs processing)' : '✅ NO');
}

console.log('\n📦 Testing Firebase Admin SDK...\n');

async function testFirebase() {
  try {
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    
    if (getApps().length === 0) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      privateKey = privateKey.replace(/^["']|["']$/g, '');
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      const app = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully');
      
      const db = getFirestore(app);
      console.log('✅ Firestore instance created');
      
      // Test reading from menu collection
      console.log('\n📖 Testing Firestore read...');
      const snapshot = await db.collection('menu').limit(5).get();
      console.log(`✅ Successfully read from 'menu' collection`);
      console.log(`   Found ${snapshot.size} document(s)`);
      
      if (snapshot.size > 0) {
        console.log('\n📄 Sample documents:');
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`   - ${doc.id}: ${data.name || 'Unnamed'} (${data.category || 'No category'})`);
        });
      } else {
        console.log('\n⚠️  No documents found in menu collection');
        console.log('   This might be why items aren\'t persisting!');
      }
      
      // Test writing
      console.log('\n✍️  Testing Firestore write...');
      const testDoc = {
        name: 'Test Item',
        description: 'Test Description',
        price: 99.99,
        category: 'Seafood',
        created_at: new Date().toISOString(),
      };
      
      const docRef = await db.collection('menu').add(testDoc);
      console.log(`✅ Successfully created test document with ID: ${docRef.id}`);
      
      // Read it back
      const readBack = await docRef.get();
      if (readBack.exists) {
        console.log('✅ Successfully read back the test document');
        console.log('   Data:', readBack.data());
      }
      
      // Clean up
      await docRef.delete();
      console.log('✅ Test document deleted');
      
      console.log('\n🎉 All Firebase tests passed!');
      console.log('\n💡 If items still don\'t persist in the app:');
      console.log('   1. Check browser console for errors');
      console.log('   2. Verify domain is correctly configured in Firebase Console');
      console.log('   3. Check Firestore Rules allow writes');
      
    }
  } catch (error) {
    console.error('\n❌ Firebase test failed:', error.message);
    console.error('\nFull error:', error);
    
    if (error.code === 7 || error.message.includes('permission') || error.message.includes('SERVICE_DISABLED')) {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Enable Firestore in Firebase Console');
      console.error('   2. Check Firestore Rules');
      console.error('   3. Verify billing is enabled (required for Firestore)');
    }
  }
}

testFirebase().then(() => process.exit(0)).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
