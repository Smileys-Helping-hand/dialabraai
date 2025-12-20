/**
 * Helper script to format Firebase Private Key for Vercel
 * 
 * Run this to get your FIREBASE_PRIVATE_KEY in the correct format for Vercel:
 * node scripts/format-firebase-key.js
 */

const fs = require('fs');
const path = require('path');

// Try to load from .env.local
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.error('Make sure you have a .env.local file in your project root.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');

// Extract the private key
const keyMatch = envContent.match(/FIREBASE_PRIVATE_KEY="([\s\S]*?)"/);

if (!keyMatch) {
  console.error('❌ FIREBASE_PRIVATE_KEY not found in .env.local');
  console.error('Make sure your .env.local has FIREBASE_PRIVATE_KEY defined.');
  process.exit(1);
}

const privateKey = keyMatch[1];

// Format for Vercel (single line with \n escaped)
const formattedKey = privateKey.replace(/\n/g, '\\n');

console.log('\n✅ SUCCESS! Copy the value below and paste it into Vercel:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\nEnvironment Variable Name:');
console.log('FIREBASE_PRIVATE_KEY');
console.log('\nEnvironment Variable Value:');
console.log(`"${formattedKey}"`);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Steps to add to Vercel:');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add new variable:');
console.log('   - Name: FIREBASE_PRIVATE_KEY');
console.log('   - Value: (paste the value above, including quotes)');
console.log('5. Select all environments (Production, Preview, Development)');
console.log('6. Click "Save"');
console.log('7. Redeploy your application\n');

// Also export to a file for easy copying
const outputPath = path.join(__dirname, '..', 'vercel-firebase-key.txt');
fs.writeFileSync(outputPath, `FIREBASE_PRIVATE_KEY="${formattedKey}"`);
console.log(`✅ Also saved to: ${outputPath}\n`);
