// Quick email system diagnostic
// Run with: node scripts/test-email-system.js YOUR_EMAIL@gmail.com

require('dotenv').config({ path: '.env.local' })
const { Resend } = require('resend')

const testEmail = process.argv[2]

if (!testEmail) {
  console.log('❌ Usage: node scripts/test-email-system.js YOUR_EMAIL@gmail.com')
  process.exit(1)
}

const resendKey = process.env.RESEND_API_KEY

console.log('🔍 Email System Diagnostic\n')
console.log('=' .repeat(60))

// Check 1: API Key
console.log('\n1️⃣ Checking Resend API Key...')
if (!resendKey) {
  console.log('❌ RESEND_API_KEY not found in .env.local')
  process.exit(1)
}
console.log('✅ API key configured:', resendKey.substring(0, 10) + '...')

// Check 2: Initialize Resend
console.log('\n2️⃣ Initializing Resend client...')
const resend = new Resend(resendKey)
console.log('✅ Resend client initialized')

// Check 3: Test with onboarding domain (always works)
console.log('\n3️⃣ Testing with Resend onboarding domain...')
console.log(`   Sending to: ${testEmail}`)

async function testSend() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Casi Test <onboarding@resend.dev>',
      to: [testEmail],
      subject: '🧪 Casi Email System Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6932FF;">✅ Email System Working!</h1>
          <p>This test email confirms that:</p>
          <ul>
            <li>✅ Your RESEND_API_KEY is valid</li>
            <li>✅ Email delivery is working</li>
            <li>✅ Basic HTML emails render correctly</li>
          </ul>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p><strong>Next Step:</strong> Test with your custom domain (casi@heycasi.com)</p>
          <p style="color: #666; font-size: 14px;">
            <strong>Casi</strong> • Your stream's brainy co-pilot
          </p>
        </div>
      `,
    })

    if (error) {
      console.log('\n❌ Test Failed!')
      console.log('Error:', error)
      console.log('\nFull error details:', JSON.stringify(error, null, 2))
      return false
    }

    console.log('\n✅ Test Email Sent Successfully!')
    console.log('Email ID:', data?.id)
    console.log(`\nCheck your inbox: ${testEmail}`)
    console.log('(May take 30-60 seconds to arrive)')

    return true
  } catch (err) {
    console.log('\n❌ Unexpected Error!')
    console.log(err)
    return false
  }
}

// Check 4: Test with custom domain
async function testCustomDomain() {
  console.log('\n4️⃣ Testing with custom domain (casi@heycasi.com)...')
  console.log(`   Sending to: ${testEmail}`)

  try {
    const { data, error } = await resend.emails.send({
      from: 'Casi <casi@heycasi.com>',
      to: [testEmail],
      subject: '🧪 Custom Domain Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6932FF;">🎉 Custom Domain Working!</h1>
          <p>Your custom domain (heycasi.com) is verified and working correctly!</p>
          <p>Stream reports will send from: <strong>casi@heycasi.com</strong></p>
        </div>
      `,
    })

    if (error) {
      console.log('\n⚠️  Custom Domain Test Failed')
      console.log('Error:', error.message || error)

      if (error.message && error.message.includes('domain')) {
        console.log('\n📝 Action Required:')
        console.log('   1. Go to: https://resend.com/domains')
        console.log('   2. Add and verify: heycasi.com')
        console.log('   3. Configure DNS records as shown')
        console.log('\n   OR use onboarding@resend.dev in the code')
      }

      return false
    }

    console.log('\n✅ Custom Domain Test Passed!')
    console.log('Email ID:', data?.id)
    return true
  } catch (err) {
    console.log('\n❌ Custom Domain Error!')
    console.log(err.message || err)
    return false
  }
}

async function runDiagnostic() {
  console.log('\n' + '=' .repeat(60))
  console.log('Starting tests...\n')

  // Test 1: Onboarding domain (should always work)
  const onboardingWorks = await testSend()

  if (!onboardingWorks) {
    console.log('\n❌ CRITICAL: Basic email sending failed')
    console.log('   Check your RESEND_API_KEY is valid')
    process.exit(1)
  }

  // Test 2: Custom domain
  await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
  const customDomainWorks = await testCustomDomain()

  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('\n📊 Diagnostic Summary:\n')
  console.log(`   Onboarding domain: ${onboardingWorks ? '✅ Working' : '❌ Failed'}`)
  console.log(`   Custom domain:     ${customDomainWorks ? '✅ Working' : '⚠️  Needs Setup'}`)

  if (!customDomainWorks) {
    console.log('\n🔧 Recommended Fix:')
    console.log('   Update src/lib/email.ts line 39:')
    console.log('   Change: from: "Casi <casi@heycasi.com>"')
    console.log('   To:     from: "Casi <onboarding@resend.dev>"')
    console.log('\n   This will work immediately while you verify your domain.')
  } else {
    console.log('\n✅ All systems ready!')
    console.log('   Stream reports will send correctly.')
  }

  console.log('\n' + '=' .repeat(60))
}

runDiagnostic().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
