import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // No user found, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get provider token (Twitter)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.provider_token) {
      // Failed to get Twitter token, go back to Twitter link page
      return NextResponse.redirect(new URL('/auth/twitter-link', request.url))
    }

    try {
      // Fetch Twitter user data from the Twitter API
      const twitterUserResponse = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      })
      
      if (!twitterUserResponse.ok) {
        throw new Error('Failed to fetch Twitter user data')
      }
      
      const twitterData = await twitterUserResponse.json()
      
      if (twitterData.data) {
        // Update user metadata with Twitter information
        await supabase.auth.updateUser({
          data: {
            twitter_username: twitterData.data.username,
            twitter_id: twitterData.data.id,
            twitter_name: twitterData.data.name,
          }
        })
      }
    } catch (error) {
      console.error('Error fetching Twitter user data:', error)
      // Continue to dashboard even if Twitter data fetching fails
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Twitter callback error:', error)
    return NextResponse.redirect(new URL('/auth/twitter-link?error=callback_failed', request.url))
  }
} 