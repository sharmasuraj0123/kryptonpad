'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase-browser'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          throw new Error(sessionError?.message || 'No session found')
        }

        // Get the user's Twitter data from the provider token
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          throw new Error(userError?.message || 'Failed to get user data')
        }

        // Extract Twitter metadata from the provider
        const provider = user.app_metadata.provider
        if (provider !== 'twitter') {
          throw new Error('Invalid authentication provider')
        }

        const identities = user.identities || []
        const twitterIdentity = identities.find(identity => identity.provider === 'twitter')
        
        if (!twitterIdentity?.identity_data) {
          throw new Error('Twitter identity data not found')
        }

        // Update user metadata with Twitter information
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            twitter_metadata: {
              twitter_id: twitterIdentity.identity_data.sub,
              twitter_username: twitterIdentity.identity_data.preferred_username,
              twitter_name: twitterIdentity.identity_data.name,
              twitter_followers_count: twitterIdentity.identity_data.followers_count,
              twitter_following_count: twitterIdentity.identity_data.following_count,
              twitter_profile_image_url: twitterIdentity.identity_data.picture,
            }
          }
        })

        if (updateError) {
          throw new Error(updateError.message)
        }

        // Redirect to dashboard on success
        router.push('/dashboard')
      } catch (err: any) {
        console.error('Callback error:', err)
        setError(err.message)
        // Redirect to Twitter link page on error
        router.push('/auth/twitter-link')
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Processing authentication...</p>
      </div>
    </div>
  )
} 