require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testWaitlistInsert() {
  console.log('🧪 Testing waitlist insert...\n')

  const testEmail = `test-${Date.now()}@example.com`

  try {
    const { data, error } = await supabase.from('waitlist').insert([
      {
        email: testEmail,
        source: 'test-script',
        user_agent: 'Test Script',
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('❌ Insert failed with error:')
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      console.error('\n📋 Full error object:', JSON.stringify(error, null, 2))

      if (error.code === '42501') {
        console.log(
          '\n⚠️  This is a Row Level Security (RLS) policy error. The anonymous user does not have permission to insert into the waitlist table.'
        )
        console.log(
          '\n💡 To fix this, go to your Supabase dashboard and add an RLS policy that allows INSERT for anonymous users on the waitlist table.'
        )
      }
    } else {
      console.log('✅ Insert successful!')
      console.log('Data:', data)
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

testWaitlistInsert()
