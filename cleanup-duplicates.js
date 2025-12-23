// Clean up duplicate menu items in Firebase
require('dotenv').config({ path: '.env.local' });

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function cleanupDuplicates() {
  console.log('🧹 Starting Firebase cleanup...\n');
  
  try {
    // Initialize Firebase Admin
    if (getApps().length === 0) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      privateKey = privateKey.replace(/^["']|["']$/g, '');
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    
    const db = getFirestore();
    
    // Get all menu items
    const snapshot = await db.collection('menu').get();
    console.log(`📊 Found ${snapshot.size} total items\n`);
    
    // Group by name to find duplicates
    const itemsByName = new Map();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const name = data.name || 'Unnamed';
      
      if (!itemsByName.has(name)) {
        itemsByName.set(name, []);
      }
      
      itemsByName.get(name).push({
        id: doc.id,
        ...data,
      });
    });
    
    // Find duplicates
    console.log('🔍 Checking for duplicates...\n');
    const duplicates = Array.from(itemsByName.entries()).filter(([name, items]) => items.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found! Your menu is clean.\n');
      return;
    }
    
    console.log(`⚠️  Found ${duplicates.length} items with duplicates:\n`);
    
    for (const [name, items] of duplicates) {
      console.log(`📝 "${name}" - ${items.length} copies:`);
      items.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ID: ${item.id} | Price: R${item.price} | Created: ${item.created_at || 'N/A'}`);
      });
      console.log('');
    }
    
    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (query) => new Promise(resolve => rl.question(query, resolve));
    
    const answer = await question('❓ Do you want to remove duplicates? (Keep newest, delete older) [y/N]: ');
    
    if (answer.toLowerCase() !== 'y') {
      console.log('Cancelled. No changes made.');
      rl.close();
      return;
    }
    
    console.log('\n🗑️  Removing duplicates...\n');
    let deletedCount = 0;
    
    for (const [name, items] of duplicates) {
      // Sort by created_at (newest first), keep the first one, delete the rest
      const sorted = items.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      });
      
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);
      
      console.log(`📌 Keeping "${name}" (ID: ${toKeep.id})`);
      
      for (const item of toDelete) {
        await db.collection('menu').doc(item.id).delete();
        console.log(`   ❌ Deleted duplicate (ID: ${item.id})`);
        deletedCount++;
      }
      
      console.log('');
    }
    
    console.log(`✅ Cleanup complete! Deleted ${deletedCount} duplicate item(s).\n`);
    
    // Show final count
    const finalSnapshot = await db.collection('menu').get();
    console.log(`📊 Final menu has ${finalSnapshot.size} unique items.\n`);
    
    rl.close();
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.error(error);
  }
}

cleanupDuplicates().then(() => process.exit(0)).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
