// src/app/dashboard/page.tsx - Server-side wrapper with Agency redirect
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { DashboardClient } from './DashboardClient'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  try {
    // Get all Supabase auth cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // Look for Supabase auth token in various cookie formats
    const authCookie = allCookies.find(
      (cookie) =>
        cookie.name.includes('sb-') &&
        (cookie.name.includes('auth-token') || cookie.name.includes('access-token'))
    )

    if (authCookie?.value) {
      // Create server-side Supabase client with service role for reliable queries
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Verify and get user from token
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(authCookie.value)

      if (!userError && user) {
        // Fetch tier from subscriptions table
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('tier_name')
          .eq('user_id', user.id)
          .maybeSingle()

        // If Agency tier, check if they're an organization owner
        if (subscription?.tier_name === 'Agency') {
          const { data: member } = await supabase
            .from('organization_members')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle()

          if (member?.role === 'owner') {
            // Redirect Agency owners to Agency dashboard BEFORE any UI renders
            redirect('/dashboard/agency')
          }
        }
      }
    }
  } catch (error) {
    // Log but don't block - if Agency check fails, let normal dashboard handle auth
    console.error('[Dashboard] Error checking Agency redirect:', error)
  }

  // Not Agency owner or check failed - render normal dashboard
  return <DashboardClient />
}
