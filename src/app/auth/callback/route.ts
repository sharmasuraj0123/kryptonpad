import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  
  // For debugging
  console.log('Callback received with URL:', request.url);
  console.log('Search params:', Object.fromEntries(requestUrl.searchParams.entries()));
  console.log('Code:', code ? 'present' : 'missing');
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    try {
      console.log('Attempting to exchange code for session...');
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error.message);
        console.error('Error details:', error);
        return NextResponse.redirect('http://localhost:3000/auth/auth-code-error?reason=' + encodeURIComponent(error.message))
      }
      
      console.log('Session exchange successful, user authenticated');
      
      // Successful authentication, redirect to dashboard
      return NextResponse.redirect('http://localhost:3000/dashboard')
    } catch (err) {
      console.error('Unexpected error in callback:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.redirect('http://localhost:3000/auth/auth-code-error?reason=' + encodeURIComponent(errorMsg))
    }
  }

  // No code provided, redirect to error page
  return NextResponse.redirect('http://localhost:3000/auth/auth-code-error?reason=no_code')
} 