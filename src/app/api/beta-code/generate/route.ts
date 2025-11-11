import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Generate Beta Code API
 * POST /api/beta-code/generate
 *
 * Generates a unique beta code for a user and sends them an email
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Generate unique code: CASI-XXXXX (5 random alphanumeric chars)
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars
      let code = 'CASI-'
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    let betaCode = generateCode()
    let codeExists = true
    let attempts = 0

    // Ensure unique code (max 10 attempts)
    while (codeExists && attempts < 10) {
      const { data } = await supabase
        .from('beta_codes')
        .select('code')
        .eq('code', betaCode)
        .single()

      if (!data) {
        codeExists = false
      } else {
        betaCode = generateCode()
        attempts++
      }
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Failed to generate unique code. Please try again.' },
        { status: 500 }
      )
    }

    // Create beta code in database
    const { error: insertError } = await supabase.from('beta_codes').insert({
      code: betaCode,
      max_uses: 1, // Single use per person
      current_uses: 0,
      trial_days: 14,
      active: true,
      description: `Beta code for ${email}`,
      created_at: new Date().toISOString(),
      expires_at: null, // No expiration
    })

    if (insertError) {
      console.error('Error creating beta code:', insertError)
      return NextResponse.json({ error: 'Failed to create beta code' }, { status: 500 })
    }

    // Send beta code email
    try {
      await fetch(`${req.nextUrl.origin}/api/send-beta-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          betaCode,
        }),
      })
    } catch (emailError) {
      console.error('Failed to send beta code email:', emailError)
      // Don't fail the request if email fails
    }

    console.log(`✅ Generated beta code ${betaCode} for ${email}`)

    return NextResponse.json({
      success: true,
      betaCode,
      message: 'Beta code generated and emailed successfully',
    })
  } catch (error: any) {
    console.error('Beta code generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
