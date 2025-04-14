import { createClient } from '@/utils/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  console.log('Received Twitter callback request', { url: req.url })
  
  // Create a Supabase client
  const supabase = await createClient()
  
  try {
    // Get the code and error from the URL query parameters
    const requestUrl = new URL(req.url)
    const origin = requestUrl.origin
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')
    
    // If there was an error during the OAuth process, redirect to the Twitter link page with the error
    if (error || !code) {
      console.error('Twitter OAuth error:', { error, errorDescription })
      const redirectUrl = new URL('/auth/twitter-link', origin)
      
      if (errorDescription) {
        redirectUrl.searchParams.set('error', encodeURIComponent(errorDescription))
      } else if (error) {
        redirectUrl.searchParams.set('error', encodeURIComponent(error))
      } else {
        redirectUrl.searchParams.set('error', encodeURIComponent('Missing authorization code'))
      }
      
      return NextResponse.redirect(redirectUrl.toString())
    }
    
    console.log('Processing Twitter OAuth callback with code')
    
    // Exchange the code for a session
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('Error exchanging code for session:', sessionError)
      const redirectUrl = new URL('/auth/twitter-link', origin)
      redirectUrl.searchParams.set('error', encodeURIComponent('Failed to authenticate with Twitter: ' + sessionError.message))
      return NextResponse.redirect(redirectUrl.toString())
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user after session exchange:', userError)
      const redirectUrl = new URL('/auth/twitter-link', origin)
      redirectUrl.searchParams.set('error', encodeURIComponent('Failed to retrieve user information'))
      return NextResponse.redirect(redirectUrl.toString())
    }
    
    console.log('Successfully authenticated user with Twitter')
    
    try {
      // Extract Twitter data from user metadata
      const twitterData = sessionData.user.user_metadata || {}
      
      console.log('User ID:', sessionData.user.id)
      console.log('User email:', sessionData.user.email)
      console.log('Twitter metadata:', twitterData)
      
      // Extract Twitter information from the metadata
      const twitterId = twitterData.sub || twitterData.provider_id || ''
      const twitterUsername = twitterData.user_name || twitterData.preferred_username || ''
      const twitterName = twitterData.full_name || twitterData.name || ''
      
      if (!twitterId || !twitterUsername) {
        throw new Error('Twitter ID or username not found in authentication data')
      }
      
      // Update the user's metadata with the Twitter information
      const updateData = {
        twitter_id: twitterId,
        twitter_username: twitterUsername,
        twitter_name: twitterName
      }
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: updateData
      })
      
      if (updateError) {
        console.error('Error updating user metadata:', updateError)
        throw new Error(`Failed to update user profile: ${updateError.message}`)
      }
      
      // Update profiles table
      try {
        // First check if we can select any row from profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()
          
        if (profilesError) {
          if (profilesError.code === 'PGRST116') {
            // Table exists but no row found for this user, try to insert
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ id: user.id })
              
            if (insertError) {
              console.error('Error inserting into profiles table:', insertError)
            }
          } else {
            console.error('Error checking profiles table:', profilesError)
          }
        }
        
        // Update profiles table with Twitter data
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            twitter_id: twitterId,
            twitter_username: twitterUsername,
            twitter_name: twitterName
          })
          .eq('id', user.id)
        
        if (profileUpdateError) {
          console.error('Error updating profiles table with Twitter data:', profileUpdateError)
          // Don't throw error here - we'll continue even if profile update fails
        } else {
          console.log('Successfully updated profiles table with Twitter data')
        }
      } catch (profileError) {
        console.error('Exception in profiles update:', profileError)
        // Continue even if profiles update fails
      }
      
      console.log('Successfully updated user with Twitter information, redirecting to dashboard')
      
      // Redirect to the dashboard
      return NextResponse.redirect(new URL('/dashboard', origin).toString())
    } catch (error: any) {
      console.error('Error processing Twitter data:', error)
      
      // Redirect to the Twitter link page with the error
      const redirectUrl = new URL('/auth/twitter-link', origin)
      redirectUrl.searchParams.set('error', encodeURIComponent(error.message || 'Failed to fetch Twitter user data'))
      return NextResponse.redirect(redirectUrl.toString())
    }
  } catch (error: any) {
    console.error('Unexpected error in Twitter callback:', error)
    
    // Final fallback - redirect to the Twitter link page with a generic error
    const redirectUrl = new URL('/auth/twitter-link', new URL(req.url).origin)
    redirectUrl.searchParams.set('error', encodeURIComponent('An unexpected error occurred. Please try again.'))
    return NextResponse.redirect(redirectUrl.toString())
  }
} 