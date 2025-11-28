import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/agency/invite
 * Invite a streamer to an organization
 *
 * Body:
 * {
 *   organizationId: string (UUID)
 *   email: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { organizationId, email } = await req.json()

    // Validate inputs
    if (!organizationId || !email) {
      return NextResponse.json({ error: 'organizationId and email are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Get the requesting user from auth header (if available)
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '')

    // Verify the user and get their ID
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify that the requesting user owns this organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .eq('owner_id', user.id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found or you do not have permission' },
        { status: 403 }
      )
    }

    // Check if user with this email exists in auth.users
    const { data: existingUser, error: userLookupError } = await supabase.auth.admin.listUsers()

    if (userLookupError) {
      console.error('Error looking up users:', userLookupError)
      return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 })
    }

    // Find user by email
    const targetUser = existingUser.users.find((u) => u.email === email)

    if (!targetUser) {
      // User does not exist yet
      return NextResponse.json(
        {
          error: 'User not found',
          message:
            'This user has not signed up yet. Please ask them to create an account first, then you can add them to your organization.',
        },
        { status: 404 }
      )
    }

    // Check if user is already a member of this organization
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', targetUser.id)
      .single()

    if (existingMember) {
      return NextResponse.json(
        {
          error: 'User already in organization',
          message: `${email} is already a member of this organization.`,
        },
        { status: 409 }
      )
    }

    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected
      console.error('Error checking existing membership:', memberCheckError)
      return NextResponse.json({ error: 'Failed to check membership status' }, { status: 500 })
    }

    // Check if user is already a member of ANOTHER organization
    const { data: otherOrgMembership, error: otherOrgError } = await supabase
      .from('organization_members')
      .select('*, organizations(*)')
      .eq('user_id', targetUser.id)
      .single()

    if (otherOrgMembership) {
      return NextResponse.json(
        {
          error: 'User already in another organization',
          message: `${email} is already a member of "${otherOrgMembership.organizations.name}". Users can only belong to one organization at a time.`,
        },
        { status: 409 }
      )
    }

    if (otherOrgError && otherOrgError.code !== 'PGRST116') {
      console.error('Error checking other org membership:', otherOrgError)
      return NextResponse.json(
        { error: 'Failed to check organization membership' },
        { status: 500 }
      )
    }

    // Add user to organization as 'talent'
    const { data: newMember, error: insertError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: targetUser.id,
        role: 'talent',
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error adding member to organization:', insertError)
      return NextResponse.json({ error: 'Failed to add member to organization' }, { status: 500 })
    }

    console.log(
      `✅ Added ${email} (${targetUser.id}) to organization ${organization.name} (${organizationId})`
    )

    // TODO: Send invitation email to the user notifying them they've been added

    return NextResponse.json({
      success: true,
      member: {
        id: newMember.id,
        email: email,
        userId: targetUser.id,
        role: 'talent',
        joinedAt: newMember.joined_at,
      },
      message: `${email} has been successfully added to ${organization.name}`,
    })
  } catch (error: any) {
    console.error('Agency invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/agency/invite
 * Remove a member from an organization
 *
 * Body:
 * {
 *   organizationId: string (UUID)
 *   userId: string (UUID)
 * }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { organizationId, userId } = await req.json()

    // Validate inputs
    if (!organizationId || !userId) {
      return NextResponse.json({ error: 'organizationId and userId are required' }, { status: 400 })
    }

    // Get the requesting user from auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify that the requesting user owns this organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .eq('owner_id', user.id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found or you do not have permission' },
        { status: 403 }
      )
    }

    // Prevent owner from removing themselves
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the organization' },
        { status: 400 }
      )
    }

    // Remove the member
    const { error: deleteError } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove member from organization' },
        { status: 500 }
      )
    }

    console.log(`✅ Removed user ${userId} from organization ${organizationId}`)

    return NextResponse.json({
      success: true,
      message: 'Member removed from organization',
    })
  } catch (error: any) {
    console.error('Agency remove member error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
