// Script to add sample menu packs to Firestore
// Run this with: node scripts/add-sample-packs.js

const { adminDb } = require('../lib/firebase-admin');
const SHOP_SLUG = process.env.SEED_SHOP_SLUG || 'default';

const samplePacks = [
  {
    name: 'Lunch Starter Pack',
    description: 'Popular solo lunch bundle',
    category: 'Packs',
    price: 89.99,
    isPack: true,
    available: true,
    image_url: '/images/menu/platter-1.jpg',
    shopSlug: SHOP_SLUG,
    items: [
      { id: 'burger', name: 'Classic Burger', quantity: 1, price: 95.00 },
      { id: 'fries', name: 'Loaded Fries', quantity: 1, price: 55.00 },
    ],
  },
  {
    name: 'Family Value Bundle',
    description: 'Shareable family deal',
    category: 'Packs',
    price: 299.99,
    isPack: true,
    available: true,
    image_url: '/images/menu/family-pack.jpg',
    shopSlug: SHOP_SLUG,
    items: [
      { id: 'burger', name: 'Classic Burger', quantity: 3, price: 95.00 },
      { id: 'wrap', name: 'Chicken Wrap', quantity: 2, price: 85.00 },
      { id: 'fries', name: 'Loaded Fries', quantity: 2, price: 55.00 },
    ],
  },
  {
    name: 'Seafood Special',
    description: 'Fresh catch of the day with prawns and calamari',
    category: 'Packs',
    price: 159.99,
    isPack: true,
    available: true,
    image_url: '/images/menu/seafood-pack.jpg',
    items: [
      { id: 'prawns', name: 'Grilled Prawns', quantity: 10, price: 8.00 },
      { id: 'calamari', name: 'Calamari Tubes', quantity: 8, price: 7.00 },
      { id: 'fish', name: 'Fish Fillet', quantity: 2, price: 25.00 },
      { id: 'rice', name: 'Lemon Rice', quantity: 2, price: 12.00 },
    ],
  },
  {
    name: 'Chicken Lovers Pack',
    description: 'All the chicken you can handle',
    category: 'Packs',
    price: 119.99,
    isPack: true,
    available: true,
    image_url: '/images/menu/chicken-pack.jpg',
    items: [
      { id: 'chicken-full', name: 'Full Chicken', quantity: 1, price: 55.00 },
      { id: 'wings', name: 'Chicken Wings', quantity: 12, price: 3.50 },
      { id: 'drumsticks', name: 'Chicken Drumsticks', quantity: 6, price: 4.00 },
      { id: 'coleslaw', name: 'Coleslaw', quantity: 2, price: 10.00 },
    ],
  },
];

async function addSamplePacks() {
  if (!adminDb) {
    console.error('Firebase Admin not initialized. Check your environment variables.');
    process.exit(1);
  }

  console.log(`Adding sample menu packs for shop: ${SHOP_SLUG}...`);

  for (const pack of samplePacks) {
    try {
      const docRef = await adminDb.collection('menu').add(pack);
      console.log(`✅ Added pack: ${pack.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Failed to add ${pack.name}:`, error.message);
    }
  }

  console.log('Done!');
  process.exit(0);
}

addSamplePacks();
