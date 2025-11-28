import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/agency/organization
 * Get current user's organization details
 */
export async function GET(req: NextRequest) {
  try {
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

    // Check if user owns an organization
    const { data: ownedOrg, error: ownedOrgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (ownedOrg) {
      // User is an organization owner - get full details with members
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select(
          `
          id,
          user_id,
          role,
          joined_at
        `
        )
        .eq('organization_id', ownedOrg.id)

      if (membersError) {
        console.error('Error fetching members:', membersError)
      }

      // Get user details for each member
      const membersWithDetails = await Promise.all(
        (members || []).map(async (member) => {
          const { data: userData } = await supabase.auth.admin.getUserById(member.user_id)
          return {
            ...member,
            email: userData?.user?.email,
            displayName:
              userData?.user?.user_metadata?.display_name ||
              userData?.user?.user_metadata?.preferred_username,
            avatarUrl: userData?.user?.user_metadata?.avatar_url,
          }
        })
      )

      return NextResponse.json({
        organization: ownedOrg,
        role: 'owner',
        members: membersWithDetails,
      })
    }

    // Check if user is a member of an organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select(
        `
        id,
        role,
        joined_at,
        organizations (
          id,
          name,
          logo_url,
          created_at
        )
      `
      )
      .eq('user_id', user.id)
      .single()

    if (membership) {
      // User is a talent member - return limited organization details
      return NextResponse.json({
        organization: membership.organizations,
        role: membership.role,
        membership: {
          id: membership.id,
          joinedAt: membership.joined_at,
        },
      })
    }

    // User is not in any organization
    if (
      (ownedOrgError && ownedOrgError.code !== 'PGRST116') ||
      (membershipError && membershipError.code !== 'PGRST116')
    ) {
      console.error('Database error:', ownedOrgError || membershipError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      organization: null,
      role: null,
      message: 'User is not part of any organization',
    })
  } catch (error: any) {
    console.error('Get organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agency/organization
 * Create a new organization (for Agency tier)
 *
 * Body:
 * {
 *   name: string
 *   logoUrl?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { name, logoUrl } = await req.json()

    // Validate inputs
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
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

    // Check if user already owns an organization
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (existingOrg) {
      return NextResponse.json(
        {
          error: 'Organization already exists',
          message: 'You already own an organization. You can only own one organization at a time.',
          organization: existingOrg,
        },
        { status: 409 }
      )
    }

    // Check if user is already a member of another organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('*, organizations(*)')
      .eq('user_id', user.id)
      .single()

    if (membership) {
      return NextResponse.json(
        {
          error: 'Already in organization',
          message: `You are already a member of "${membership.organizations.name}". Please leave that organization before creating a new one.`,
        },
        { status: 409 }
      )
    }

    // Create the organization
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        owner_id: user.id,
        name: name.trim(),
        logo_url: logoUrl || null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating organization:', createError)
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    // Add the owner as a member with 'owner' role
    const { error: memberError } = await supabase.from('organization_members').insert({
      organization_id: newOrg.id,
      user_id: user.id,
      role: 'owner',
    })

    if (memberError) {
      console.error('Error adding owner as member:', memberError)
      // This is not critical - the organization is created, but log the error
    }

    console.log(`✅ Created organization "${name}" (${newOrg.id}) for user ${user.id}`)

    return NextResponse.json({
      success: true,
      organization: newOrg,
      message: `Organization "${name}" created successfully`,
    })
  } catch (error: any) {
    console.error('Create organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/agency/organization
 * Update organization details
 *
 * Body:
 * {
 *   organizationId: string (UUID)
 *   name?: string
 *   logoUrl?: string
 * }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { organizationId, name, logoUrl } = await req.json()

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
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

    // Build update object
    const updates: any = {}
    if (name !== undefined && name.trim().length > 0) {
      updates.name = name.trim()
    }
    if (logoUrl !== undefined) {
      updates.logo_url = logoUrl
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update the organization
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organizationId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating organization:', updateError)
      return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
    }

    console.log(`✅ Updated organization ${organizationId}`)

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      message: 'Organization updated successfully',
    })
  } catch (error: any) {
    console.error('Update organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
