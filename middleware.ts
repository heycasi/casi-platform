// middleware.ts - Agency redirect middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only intercept requests to /dashboard (not /dashboard/agency or other sub-paths)
  if (pathname === '/dashboard') {
    try {
      // Get auth cookies
      const cookies = request.cookies
      const allCookies = cookies.getAll()

      // Find Supabase auth token
      const authCookie = allCookies.find(
        (cookie) =>
          cookie.name.includes('sb-') &&
          (cookie.name.includes('auth-token') || cookie.name.includes('access-token'))
      )

      if (authCookie?.value) {
        // Create Supabase client with service role for server-side queries
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          }
        )

        // Get user from token
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser(authCookie.value)

        if (!userError && user) {
          // Fetch subscription tier
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier_name')
            .eq('user_id', user.id)
            .maybeSingle()

          // If Agency tier, check organization ownership
          if (subscription?.tier_name === 'Agency') {
            const { data: member } = await supabase
              .from('organization_members')
              .select('role')
              .eq('user_id', user.id)
              .maybeSingle()

            if (member?.role === 'owner') {
              // Redirect Agency owners to Agency dashboard
              const url = new URL('/dashboard/agency', request.url)
              console.log('[Middleware] Redirecting Agency owner to /dashboard/agency')
              return NextResponse.redirect(url)
            }
          }
        }
      }
    } catch (error) {
      // Log error but don't block access
      console.error('[Middleware] Agency redirect error:', error)
    }
  }

  // Allow request to continue for non-Agency users or if check fails
  return NextResponse.next()
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    '/dashboard',
    // Don't run on static files, API routes, or _next internals
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
