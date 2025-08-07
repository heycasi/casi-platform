#!/usr/bin/env node

/**
 * Automated setup script for Casi Stream Reports
 * This script handles all the setup steps automatically
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🎮 Setting up Casi Stream Reports...\n')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function execCommand(command, description) {
  try {
    log(`⏳ ${description}...`, 'yellow')
    execSync(command, { stdio: 'inherit' })
    log(`✅ ${description} completed`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red')
    return false
  }
}

// Step 1: Install dependencies
log('📦 Step 1: Installing dependencies', 'cyan')
if (!execCommand('npm install resend', 'Installing Resend email service')) {
  log('⚠️ If npm install fails due to file locks, please close your dev server and try again', 'yellow')
  process.exit(1)
}

// Step 2: Check environment setup
log('\n🔧 Step 2: Environment Configuration', 'cyan')

const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.example')

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    log('✅ Created .env.local from .env.example', 'green')
  } else {
    // Create basic .env.local
    const basicEnv = `# Add your environment variables here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
`
    fs.writeFileSync(envPath, basicEnv)
    log('✅ Created basic .env.local file', 'green')
  }
} else {
  log('✅ .env.local already exists', 'green')
}

// Check if required env vars are set
const envContent = fs.readFileSync(envPath, 'utf8')
const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=') && !envContent.includes('your_supabase_project_url')
const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && !envContent.includes('your_supabase_anon_key')
const hasResendKey = envContent.includes('RESEND_API_KEY=') && !envContent.includes('your_resend_api_key')

if (!hasSupabaseUrl || !hasSupabaseKey) {
  log('⚠️ Supabase environment variables need to be configured in .env.local', 'yellow')
}

if (!hasResendKey) {
  log('⚠️ RESEND_API_KEY needs to be configured in .env.local', 'yellow')
  log('   Get your key from: https://resend.com/api-keys', 'blue')
}

// Step 3: Database setup script
log('\n🗄️ Step 3: Database Setup', 'cyan')

const migrationScript = `
-- Run this in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

${fs.readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf8')}
`

const migrationPath = path.join(process.cwd(), 'database', 'run-migration.sql')
fs.writeFileSync(migrationPath, migrationScript)

log('✅ Created database migration file: database/run-migration.sql', 'green')
log('📋 Next: Copy and paste this file content into your Supabase SQL Editor', 'blue')

// Step 4: Create automated test script
log('\n🧪 Step 4: Creating test utilities', 'cyan')

const testScript = `#!/usr/bin/env node

/**
 * Test script for Casi Stream Reports
 */

const { execSync } = require('child_process')

console.log('🧪 Testing Casi Stream Reports Setup...\\n')

// Test 1: Check if server starts
console.log('🔄 Testing server startup...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build successful')
} catch (error) {
  console.log('❌ Build failed:', error.message)
  process.exit(1)
}

// Test 2: Test environment configuration
console.log('\\n🔧 Testing environment configuration...')
const fs = require('fs')
const envContent = fs.readFileSync('.env.local', 'utf8')

const checks = [
  { name: 'Supabase URL', check: envContent.includes('NEXT_PUBLIC_SUPABASE_URL=') && !envContent.includes('your_supabase_project_url') },
  { name: 'Supabase Key', check: envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && !envContent.includes('your_supabase_anon_key') },
  { name: 'Resend API Key', check: envContent.includes('RESEND_API_KEY=') && !envContent.includes('your_resend_api_key') }
]

checks.forEach(({ name, check }) => {
  console.log(check ? \`✅ \${name} configured\` : \`❌ \${name} needs configuration\`)
})

const allConfigured = checks.every(({ check }) => check)
if (allConfigured) {
  console.log('\\n🎉 All environment variables configured!')
  console.log('\\n📧 Test email delivery with:')
  console.log('curl -X POST http://localhost:3000/api/test-email -H "Content-Type: application/json" -d "{\\"email\\":\\"your@email.com\\"}}"')
} else {
  console.log('\\n⚠️ Please configure missing environment variables in .env.local')
}
`

const testScriptPath = path.join(process.cwd(), 'scripts', 'test-setup.js')
fs.writeFileSync(testScriptPath, testScript)
fs.chmodSync(testScriptPath, '755')

log('✅ Created test script: scripts/test-setup.js', 'green')

// Step 5: Add npm scripts
log('\n📋 Step 5: Adding convenience scripts', 'cyan')

const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

// Add new scripts
packageJson.scripts = {
  ...packageJson.scripts,
  'setup:reports': 'node scripts/setup-reports.js',
  'test:reports': 'node scripts/test-setup.js',
  'dev:reports': 'npm run dev && echo "Visit http://localhost:3000/api/test-email to test email delivery"'
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
log('✅ Added npm scripts for reports management', 'green')

// Step 6: Create quick start guide
log('\n📖 Step 6: Creating quick start guide', 'cyan')

const quickStart = `# 🚀 Quick Start Guide - Stream Reports

## ✅ Setup Complete!

Your Casi Stream Reports system is now set up. Here's what to do next:

### 1. Configure Environment Variables

Edit \`.env.local\` and add your actual values:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
RESEND_API_KEY=re_your_actual_resend_key
\`\`\`

### 2. Set Up Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open SQL Editor
3. Copy and paste contents of \`database/run-migration.sql\`
4. Click "Run"

### 3. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Add to \`.env.local\`

### 4. Test Everything

\`\`\`bash
# Test the setup
npm run test:reports

# Start development
npm run dev

# Test email delivery
curl -X POST http://localhost:3000/api/test-email \\
  -H "Content-Type: application/json" \\
  -d '{"email":"your@email.com"}'
\`\`\`

### 5. Try Stream Reports

1. Go to dashboard with beta code: \`CASI2025\`
2. Connect to a live Twitch channel
3. Let it run for a few minutes
4. Disconnect to trigger report generation
5. Check your email!

## 📊 What You Get

- **Real-time analytics** during streams
- **Automated reports** when streams end
- **Email delivery** with beautiful HTML
- **Sentiment analysis** and engagement tracking
- **Multi-language support** for global audiences
- **AI-powered insights** and recommendations

## 💰 Cost Estimate

- **Free tier**: Up to 100 streamers/month
- **Paid tier**: ~$0.0004 per report sent

## 🆘 Need Help?

- Check \`STREAM_REPORTS_SETUP.md\` for detailed instructions
- Run \`npm run test:reports\` to diagnose issues
- Email delivery issues? Check Resend dashboard

---
**🎮 Happy Streaming with Casi!**
`

fs.writeFileSync(path.join(process.cwd(), 'QUICK_START.md'), quickStart)
log('✅ Created QUICK_START.md guide', 'green')

// Final summary
log('\n🎉 Setup Complete!', 'green')
log('\n📋 Next Steps:', 'cyan')
log('1. Configure your environment variables in .env.local', 'blue')
log('2. Run the database migration in Supabase', 'blue')  
log('3. Get your Resend API key', 'blue')
log('4. Run: npm run test:reports', 'blue')
log('5. Run: npm run dev', 'blue')
log('\n📖 See QUICK_START.md for detailed instructions', 'magenta')