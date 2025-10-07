// Environment Variable Validation Script
// Run with: node scripts/verify-env.js

require('dotenv').config({ path: '.env.local' })

const REQUIRED_ENV_VARS = {
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': {
    description: 'Supabase project URL',
    example: 'https://xxxxx.supabase.co',
    validate: (val) => val.startsWith('https://') && val.includes('supabase.co')
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase anonymous/public key',
    example: 'eyJhbGc...',
    validate: (val) => val.startsWith('eyJ') && val.length > 100
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    description: 'Supabase service role key (server-side only)',
    example: 'eyJhbGc...',
    validate: (val) => val.startsWith('eyJ') && val.length > 100,
    sensitive: true
  },

  // Twitch OAuth
  'NEXT_PUBLIC_TWITCH_CLIENT_ID': {
    description: 'Twitch OAuth client ID',
    example: 'abc123...',
    validate: (val) => val.length > 10
  },
  'TWITCH_CLIENT_SECRET': {
    description: 'Twitch OAuth client secret',
    example: 'xyz789...',
    validate: (val) => val.length > 10,
    sensitive: true
  },

  // Email
  'RESEND_API_KEY': {
    description: 'Resend API key for sending emails',
    example: 're_...',
    validate: (val) => val.startsWith('re_'),
    sensitive: true
  },

  // Stripe
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': {
    description: 'Stripe publishable key',
    example: 'pk_test_... or pk_live_...',
    validate: (val) => val.startsWith('pk_')
  },
  'STRIPE_SECRET_KEY': {
    description: 'Stripe secret key',
    example: 'sk_test_... or sk_live_...',
    validate: (val) => val.startsWith('sk_'),
    sensitive: true
  },
  'STRIPE_WEBHOOK_SECRET': {
    description: 'Stripe webhook signing secret',
    example: 'whsec_...',
    validate: (val) => val.startsWith('whsec_'),
    sensitive: true
  },

  // Stripe Price IDs
  'NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY': {
    description: 'Stripe price ID for Creator plan (monthly)',
    example: 'price_...',
    validate: (val) => val.startsWith('price_')
  },
  'NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY': {
    description: 'Stripe price ID for Creator plan (yearly)',
    example: 'price_...',
    validate: (val) => val.startsWith('price_')
  },
  'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY': {
    description: 'Stripe price ID for Pro plan (monthly)',
    example: 'price_...',
    validate: (val) => val.startsWith('price_')
  },
  'NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY': {
    description: 'Stripe price ID for Pro plan (yearly)',
    example: 'price_...',
    validate: (val) => val.startsWith('price_')
  },
  'NEXT_PUBLIC_STRIPE_PRICE_STREAMER_MONTHLY': {
    description: 'Stripe price ID for Streamer+ plan (monthly)',
    example: 'price_...',
    validate: (val) => val.startsWith('price_')
  },
  'NEXT_PUBLIC_STRIPE_PRICE_STREAMER_YEARLY': {
    description: 'Stripe price ID for Streamer+ plan (yearly)',
    example: 'price_...',
    validate: (val) => val.startsWith('price_')
  },

  // Site Configuration
  'NEXT_PUBLIC_SITE_URL': {
    description: 'Production site URL',
    example: 'https://heycasi.com',
    validate: (val) => val.startsWith('http')
  }
}

function maskValue(value, sensitive) {
  if (!value) return '<missing>'
  if (sensitive) {
    return value.substring(0, 8) + '...' + value.substring(value.length - 4)
  }
  return value
}

function verifyEnvironmentVariables() {
  console.log('🔍 Verifying Environment Variables for Casi Platform\n')
  console.log('=' .repeat(80))

  let allValid = true
  const missing = []
  const invalid = []
  const warnings = []

  // Check each required variable
  for (const [varName, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[varName]
    const status = value ? '✅' : '❌'

    if (!value) {
      console.log(`${status} ${varName.padEnd(45)} - MISSING`)
      console.log(`   Description: ${config.description}`)
      console.log(`   Example: ${config.example}`)
      console.log()
      missing.push(varName)
      allValid = false
      continue
    }

    // Validate the value
    if (config.validate && !config.validate(value)) {
      console.log(`⚠️  ${varName.padEnd(45)} - INVALID FORMAT`)
      console.log(`   Current: ${maskValue(value, config.sensitive)}`)
      console.log(`   Expected: ${config.example}`)
      console.log()
      invalid.push(varName)
      allValid = false
      continue
    }

    console.log(`${status} ${varName.padEnd(45)} - ${maskValue(value, config.sensitive)}`)
  }

  console.log('\n' + '=' .repeat(80))

  // Check Stripe mode
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (stripeKey) {
    const isTestMode = stripeKey.startsWith('sk_test_')
    const isLiveMode = stripeKey.startsWith('sk_live_')

    console.log('\n💳 Stripe Mode:')
    if (isTestMode) {
      console.log('   ⚠️  TEST MODE - Payments will not be real')
      console.log('   Switch to LIVE mode for production')
      warnings.push('Stripe is in TEST mode')
    } else if (isLiveMode) {
      console.log('   🚀 LIVE MODE - Real payments enabled')
      console.log('   ⚠️  Make sure all testing is complete!')
      warnings.push('Stripe is in LIVE mode - real money!')
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(80))
  console.log('\n📊 Summary:\n')

  const totalVars = Object.keys(REQUIRED_ENV_VARS).length
  const foundVars = totalVars - missing.length
  console.log(`   Total required variables: ${totalVars}`)
  console.log(`   Found: ${foundVars}`)
  console.log(`   Missing: ${missing.length}`)
  console.log(`   Invalid: ${invalid.length}`)

  if (missing.length > 0) {
    console.log('\n❌ Missing variables:')
    missing.forEach(v => console.log(`   - ${v}`))
  }

  if (invalid.length > 0) {
    console.log('\n⚠️  Invalid variables:')
    invalid.forEach(v => console.log(`   - ${v}`))
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach(w => console.log(`   - ${w}`))
  }

  console.log('\n' + '=' .repeat(80))

  if (allValid) {
    console.log('\n✅ All environment variables are configured correctly!\n')
    console.log('🎯 Next Steps:')
    console.log('   1. Verify Supabase database tables: npm run migrate:verify')
    console.log('   2. Test Twitch OAuth flow')
    console.log('   3. Test Stripe checkout flow')
    console.log('   4. Configure Stripe webhook in dashboard\n')
    process.exit(0)
  } else {
    console.log('\n❌ Environment configuration is incomplete or invalid!\n')
    console.log('🔧 To fix:')
    console.log('   1. Create/update .env.local file in project root')
    console.log('   2. Add missing variables listed above')
    console.log('   3. Run this script again: node scripts/verify-env.js\n')
    process.exit(1)
  }
}

// Check if .env.local exists
const fs = require('fs')
const path = require('path')
const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(envPath)) {
  console.log('⚠️  Warning: .env.local file not found!')
  console.log('   Creating template .env.local file...\n')

  const template = Object.entries(REQUIRED_ENV_VARS)
    .map(([key, config]) => `# ${config.description}\n${key}=${config.example}\n`)
    .join('\n')

  fs.writeFileSync(envPath, template)
  console.log('✅ Created .env.local template')
  console.log('   Please fill in the actual values and run this script again.\n')
  process.exit(1)
}

verifyEnvironmentVariables()
