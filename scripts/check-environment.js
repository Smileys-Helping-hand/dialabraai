/**
 * Environment variables checker
 * Run: npm run check-env
 */

console.log('🔍 Checking Firebase Environment Variables...\n');

const required = {
  public: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ],
  server: [
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ],
};

let allGood = true;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('CLIENT-SIDE VARIABLES (Public):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

required.public.forEach((key) => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: SET`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    allGood = false;
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SERVER-SIDE VARIABLES (Secret):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

required.server.forEach((key) => {
  const value = process.env[key];
  if (value) {
    if (key === 'FIREBASE_PRIVATE_KEY') {
      const hasBegin = value.includes('BEGIN PRIVATE KEY');
      const hasEnd = value.includes('END PRIVATE KEY');
      if (hasBegin && hasEnd) {
        console.log(`✅ ${key}: SET (${value.length} chars, valid format)`);
      } else {
        console.log(`⚠️  ${key}: SET but may be malformed (missing BEGIN/END markers)`);
        allGood = false;
      }
    } else {
      console.log(`✅ ${key}: SET`);
    }
  } else {
    console.log(`❌ ${key}: MISSING`);
    allGood = false;
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (allGood) {
  console.log('✅ All environment variables are properly configured!\n');
  console.log('You can now:');
  console.log('  • Run locally: npm run dev');
  console.log('  • Deploy to Vercel: git push');
  console.log('  • Test health: http://localhost:3000/api/health-check\n');
} else {
  console.log('❌ Some environment variables are missing or malformed.\n');
  console.log('Next steps:');
  console.log('  1. Make sure .env.local exists in your project root');
  console.log('  2. Copy all values from .env.local to Vercel');
  console.log('  3. Run: npm run format-key (to get Vercel-ready format)');
  console.log('  4. Redeploy after adding variables\n');
  process.exit(1);
}
