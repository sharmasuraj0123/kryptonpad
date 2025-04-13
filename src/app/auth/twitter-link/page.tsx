'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase-browser'

export default function TwitterLink() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [linkLoading, setLinkLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function checkUserStatus() {
      const supabase = createClient()
      
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !currentUser) {
          setError('Failed to get user information. Please try logging in again.')
          router.push('/login')
          return
        }
        
        // Check if email is confirmed
        if (!currentUser.email_confirmed_at) {
          router.push('/auth/verify')
          return
        }
        
        // Enhanced Twitter metadata check
        const twitterMetadata = currentUser.user_metadata?.twitter_metadata
        if (twitterMetadata?.twitter_id && twitterMetadata?.twitter_username) {
          router.push('/dashboard')
          return
        }
        
        setUser(currentUser)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('An unexpected error occurred. Please try logging in again.')
        setLoading(false)
      }
    }
    
    checkUserStatus()
  }, [router])

  const handleTwitterLink = async () => {
    setLinkLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          scopes: 'tweet.read users.read offline.access',
        }
      })
      
      if (signInError) {
        setError(signInError.message)
        setLinkLoading(false)
        return
      }

      // The redirect happens automatically, but we'll add error handling
      if (!data.url) {
        setError('Failed to get authorization URL')
        setLinkLoading(false)
        return
      }
    } catch (err) {
      console.error('Twitter link error:', err)
      setError('Failed to start Twitter authentication. Please try again.')
      setLinkLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  const connectWallet = () => {
    router.push('/auth/wallet-connect')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile</h1>
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-blue-400 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Please choose how you'd like to complete your profile setup:
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={handleTwitterLink}
              disabled={linkLoading}
              className="w-full py-3 px-4 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              Connect with Twitter
            </button>
            
            <div className="text-center text-gray-500 dark:text-gray-400">OR</div>
            
            <button
              onClick={connectWallet}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 7h-1V6c0-1.1-.9-2-2-2H8C6.9 4 6 4.9 6 6v1H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-1 10H6V9h12v8zM8 6h8v1H8V6z" />
              </svg>
              Connect Wallet Instead
            </button>

            <button
              onClick={handleSkip}
              className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-4"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 