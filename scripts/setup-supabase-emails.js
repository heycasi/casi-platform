#!/usr/bin/env node

/**
 * Supabase Email Configuration Helper
 *
 * This script provides instructions and validation for setting up
 * branded emails with Supabase Auth + Resend.
 */

const fs = require('fs');
const path = require('path');

console.log('\n🎨 Casi Email Configuration Setup\n');
console.log('═'.repeat(60));

// Check for Resend API key
const envPath = path.join(__dirname, '..', '.env.local');
let resendKey = null;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/RESEND_API_KEY=(.+)/);
  if (match) {
    resendKey = match[1].trim();
    console.log('✅ Found Resend API Key in .env.local');
  }
}

if (!resendKey) {
  console.log('❌ RESEND_API_KEY not found in .env.local');
  process.exit(1);
}

// Check for email templates
const templatesDir = path.join(__dirname, '..', 'email-templates');
const requiredTemplates = [
  'supabase-password-reset.html',
  'supabase-confirmation.html',
  'supabase-magic-link.html'
];

console.log('\n📧 Email Templates:');
let allTemplatesExist = true;
for (const template of requiredTemplates) {
  const exists = fs.existsSync(path.join(templatesDir, template));
  console.log(`  ${exists ? '✅' : '❌'} ${template}`);
  if (!exists) allTemplatesExist = false;
}

if (!allTemplatesExist) {
  console.log('\n❌ Missing email templates! Run the email setup first.');
  process.exit(1);
}

console.log('\n' + '═'.repeat(60));
console.log('\n📋 MANUAL SETUP REQUIRED (Supabase Dashboard)\n');

console.log('Step 1: Configure SMTP in Supabase');
console.log('─'.repeat(60));
console.log('1. Open your Supabase Dashboard');
console.log('2. Go to: Project Settings → Auth → SMTP Settings');
console.log('3. Enable "Custom SMTP"');
console.log('4. Enter these values:\n');

console.log('   SMTP Host:     smtp.resend.com');
console.log('   SMTP Port:     587');
console.log('   SMTP Username: resend');
console.log(`   SMTP Password: ${resendKey.substring(0, 10)}...${resendKey.slice(-4)}`);
console.log('   Sender Email:  casi@heycasi.com');
console.log('   Sender Name:   Casi');

console.log('\n5. Click "Save"');

console.log('\n' + '─'.repeat(60));
console.log('\nStep 2: Update Email Templates');
console.log('─'.repeat(60));
console.log('1. Go to: Authentication → Email Templates');
console.log('2. For each template below, copy & paste the HTML:\n');

for (const template of requiredTemplates) {
  const templateType = template.replace('supabase-', '').replace('.html', '');
  const templatePath = path.join(templatesDir, template);
  console.log(`   ${templateType.toUpperCase()}:`);
  console.log(`   → Open: ${template}`);
  console.log(`   → Select template in Supabase, paste content, save\n`);
}

console.log('─'.repeat(60));
console.log('\nStep 3: Configure Redirect URLs');
console.log('─'.repeat(60));
console.log('1. Go to: Authentication → URL Configuration');
console.log('2. Set these values:\n');
console.log('   Site URL: https://www.heycasi.com');
console.log('   Additional Redirect URLs:');
console.log('     - https://www.heycasi.com/auth/callback');
console.log('     - https://www.heycasi.com/auth/reset-password');
console.log('     - https://www.heycasi.com/dashboard');

console.log('\n' + '═'.repeat(60));
console.log('\n✨ After Setup - Testing\n');
console.log('1. Sign up a new test user');
console.log('2. Check email for branded confirmation');
console.log('3. Test password reset from /account');
console.log('4. Verify emails come from casi@heycasi.com\n');

console.log('═'.repeat(60));
console.log('\n💡 Quick Copy Commands:\n');

console.log('# Copy SMTP Password to clipboard:');
if (process.platform === 'darwin') {
  console.log(`echo "${resendKey}" | pbcopy`);
} else if (process.platform === 'win32') {
  console.log(`echo ${resendKey} | clip`);
} else {
  console.log(`echo "${resendKey}" | xclip -selection clipboard`);
}

console.log('\n# View email templates:');
console.log(`cd email-templates && ls -la`);

console.log('\n' + '═'.repeat(60) + '\n');

// Create a quick reference file
const quickRef = `
SUPABASE EMAIL SETUP - QUICK REFERENCE
======================================

SMTP CONFIGURATION
------------------
Host:     smtp.resend.com
Port:     587
Username: resend
Password: ${resendKey}
From:     casi@heycasi.com
Name:     Casi

REDIRECT URLS
-------------
Site URL: https://www.heycasi.com

Additional URLs:
- https://www.heycasi.com/auth/callback
- https://www.heycasi.com/auth/reset-password
- https://www.heycasi.com/dashboard

EMAIL TEMPLATES
---------------
Location: ./email-templates/
- supabase-password-reset.html
- supabase-confirmation.html
- supabase-magic-link.html

Copy each template into corresponding section in:
Supabase Dashboard → Authentication → Email Templates
`;

const refPath = path.join(__dirname, '..', 'SUPABASE_EMAIL_SETUP.txt');
fs.writeFileSync(refPath, quickRef);

console.log(`📄 Created quick reference file: SUPABASE_EMAIL_SETUP.txt\n`);
console.log('   (This file contains your API key - keep it secure!)\n');
