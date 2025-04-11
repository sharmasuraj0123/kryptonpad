import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Debug log to see if we have a user and what's in middleware
  console.log('Middleware - User status:', user ? 'Authenticated' : 'Not authenticated')
  if (user) {
    console.log('User has wallet address:', !!user.user_metadata?.wallet_address)
  }

  // URL for debugging
  console.log('Request URL:', request.nextUrl.pathname)

  // Allow users to visit login and auth routes even if not logged in
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api/check-auth') &&
    !request.nextUrl.pathname.startsWith('/api/debug') &&
    !request.nextUrl.pathname.startsWith('/api/setup-db') &&
    !request.nextUrl.pathname.startsWith('/api/update-wallet-address') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    request.nextUrl.pathname !== '/'
  ) {
    // no user, redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in but not verified, redirect to verification page
  // Removing email verification check
  /*
  if (
    user && 
    !user.email_confirmed_at && 
    !request.nextUrl.pathname.startsWith('/auth/verify')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/verify'
    return NextResponse.redirect(url)
  }
  */

  // If user is verified but has neither Twitter nor wallet connected, and not on setup pages
  if (
    user && 
    !user.user_metadata?.twitter_username && 
    !user.user_metadata?.wallet_address && 
    !request.nextUrl.pathname.startsWith('/auth/twitter-link') && 
    !request.nextUrl.pathname.startsWith('/auth/wallet-connect') && 
    !request.nextUrl.pathname.startsWith('/dashboard') && // Allow access to dashboard
    !request.nextUrl.pathname.startsWith('/api/') // Don't redirect API routes
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/twitter-link'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 