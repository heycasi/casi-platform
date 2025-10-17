import { NextRequest, NextResponse } from 'next/server'
import { getUserTierStatus } from '@/lib/tierTracking'

/**
 * API endpoint to get tier status for a user
 * GET /api/tier-status?email=user@example.com
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const tierStatus = await getUserTierStatus(email)

    if (!tierStatus) {
      return NextResponse.json(
        { error: 'No tier status found' },
        { status: 404 }
      )
    }

    return NextResponse.json(tierStatus)
  } catch (error: any) {
    console.error('Error fetching tier status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tier status' },
      { status: 500 }
    )
  }
}
