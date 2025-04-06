'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase-browser'

export default function VerifyEmail() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getUserEmail() {
      const supabase = createClient()
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          setError('Failed to get user information. Please try logging in again.')
          setLoading(false)
          return
        }
        
        if (!user) {
          // No user found, redirect to login
          router.push('/login')
          return
        }
        
        // Check if email is already confirmed
        if (user.email_confirmed_at) {
          // Email is confirmed, redirect to Twitter linking or dashboard
          if (!user.user_metadata?.twitter_username) {
            router.push('/auth/twitter-link')
          } else {
            router.push('/dashboard')
          }
          return
        }
        
        if (user.email) {
          setEmail(user.email)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('An unexpected error occurred. Please try logging in again.')
        setLoading(false)
      }
    }
    
    getUserEmail()
  }, [router])

  const handleResendVerification = async () => {
    if (!email) return
    
    setLoading(true)
    const supabase = createClient()
    
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (resendError) {
        setError(resendError.message)
      } else {
        setError(null)
        alert('Verification email resent! Please check your inbox.')
      }
    } catch (err) {
      console.error('Error resending verification:', err)
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify your email</h1>
          <div className="mb-6">
            <svg 
              className="w-16 h-16 text-blue-500 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              We sent a verification email to <span className="font-semibold">{email}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Please check your inbox and click the verification link to continue.
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Resend verification email'}
          </button>
          
          <div className="mt-4">
            <button 
              onClick={() => router.push('/login')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 