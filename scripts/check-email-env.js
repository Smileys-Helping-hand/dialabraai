#!/usr/bin/env node

/**
 * Email System Environment Checker
 * Run with: node scripts/check-email-env.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n' + '='.repeat(60));
console.log('📧 EMAIL SYSTEM CONFIGURATION CHECK');
console.log('='.repeat(60) + '\n');

// Check Security
const hasInternalKey = Boolean(process.env.INTERNAL_API_KEY);
console.log(`🔐 INTERNAL_API_KEY: ${hasInternalKey ? '✅ SET' : '❌ NOT SET'}`);

// Check AWS Credentials
const hasAwsAccessKey = Boolean(process.env.AWS_ACCESS_KEY_ID);
const hasAwsSecretKey = Boolean(process.env.AWS_SECRET_ACCESS_KEY);
const hasAwsRegion = Boolean(process.env.AWS_REGION);
const hasFromEmail = Boolean(process.env.AWS_SES_FROM_EMAIL);

console.log('\n' + '-'.repeat(60));
console.log('AWS SES CONFIGURATION');
console.log('-'.repeat(60));
console.log(`AWS_ACCESS_KEY_ID: ${hasAwsAccessKey ? '✅ SET' : '⚠️  NOT SET'}`);
console.log(`AWS_SECRET_ACCESS_KEY: ${hasAwsSecretKey ? '✅ SET' : '⚠️  NOT SET'}`);
console.log(`AWS_REGION: ${hasAwsRegion ? `✅ ${process.env.AWS_REGION}` : '⚠️  NOT SET (will default to us-east-1)'}`);
console.log(`AWS_SES_FROM_EMAIL: ${hasFromEmail ? `✅ ${process.env.AWS_SES_FROM_EMAIL}` : '⚠️  NOT SET (will use noreply@dialabraai.com)'}`);

console.log('\n' + '-'.repeat(60));
console.log('SYSTEM MODE');
console.log('-'.repeat(60));

if (hasAwsAccessKey && hasAwsSecretKey) {
  console.log('🟢 REAL MODE: Emails will be sent via AWS SES');
  console.log('   Make sure your "From" email is verified in AWS SES!');
} else {
  console.log('🟡 SIMULATION MODE: Emails will be logged to console');
  console.log('   Add AWS credentials to switch to real email sending.');
}

console.log('\n' + '-'.repeat(60));
console.log('RECOMMENDATIONS');
console.log('-'.repeat(60));

if (!hasInternalKey) {
  console.log('❌ CRITICAL: Add INTERNAL_API_KEY to secure your dispatch API!');
  console.log('   Generate one with: openssl rand -base64 32');
}

if (hasAwsAccessKey && hasAwsSecretKey && !hasFromEmail) {
  console.log('⚠️  WARNING: Set AWS_SES_FROM_EMAIL to use your domain');
}

if (!hasAwsAccessKey || !hasAwsSecretKey) {
  console.log('💡 TIP: Add AWS SES credentials when ready for real emails');
  console.log('   See EMAIL-DISPATCH-GUIDE.md for setup instructions');
}

console.log('\n' + '='.repeat(60));
console.log('✅ Check complete!');
console.log('='.repeat(60) + '\n');
