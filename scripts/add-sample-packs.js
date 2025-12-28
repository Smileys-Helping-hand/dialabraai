// Script to add sample menu packs to Firestore
// Run this with: node scripts/add-sample-packs.js

const { adminDb } = require('../lib/firebase-admin');

const samplePacks = [
  {
    name: 'Platter for 1',
    description: 'Perfect individual meal with a variety of meats',
    category: 'Packs',
    price: 89.99,
    isPack: true,
    available: true,
    image_url: '/images/menu/platter-1.jpg',
    items: [
      { id: 'chops', name: 'Lamb Chops', quantity: 3, price: 15.00 },
      { id: 'chicken', name: 'Chicken Pieces', quantity: 2, price: 12.00 },
      { id: 'boerewors', name: 'Boerewors', quantity: 1, price: 18.00 },
      { id: 'pap', name: 'Pap & Sauce', quantity: 1, price: 8.00 },
    ],
  },
  {
    name: 'Family Braai Pack',
    description: 'Feed the whole family with this generous combo',
    category: 'Packs',
    price: 299.99,
    isPack: true,
    available: true,
    image_url: '/images/menu/family-pack.jpg',
    items: [
      { id: 'chops', name: 'Lamb Chops', quantity: 10, price: 15.00 },
      { id: 'chicken', name: 'Chicken Pieces', quantity: 8, price: 12.00 },
      { id: 'sosaties', name: 'Sosaties', quantity: 6, price: 10.00 },
      { id: 'boerewors', name: 'Boerewors', quantity: 3, price: 18.00 },
      { id: 'pap', name: 'Pap & Sauce', quantity: 4, price: 8.00 },
      { id: 'salad', name: 'Garden Salad', quantity: 2, price: 15.00 },
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

  console.log('Adding sample menu packs...');

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
