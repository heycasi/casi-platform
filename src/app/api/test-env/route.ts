// Test endpoint to check if environment variable is loaded
import { NextResponse } from 'next/server'

export async function GET() {
  const secret = process.env.TWITCH_EVENTSUB_SECRET

  return NextResponse.json({
    hasSecret: !!secret,
    secretLength: secret?.length || 0,
    firstChars: secret?.substring(0, 8) || 'not found'
  })
}
