'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase-browser'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/login')
          return
        }
        
        setUser(user)
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KryptonPad</h1>
          <div className="flex items-center">
            <div className="mr-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Welcome, </span>
              <span className="font-semibold text-gray-900 dark:text-white">{user?.user_metadata?.name || user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Full Name:</span>
              <p className="text-gray-900 dark:text-white">{user?.user_metadata?.name || 'Not provided'}</p>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Country:</span>
              <p className="text-gray-900 dark:text-white">{user?.user_metadata?.country || 'Not provided'}</p>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Twitter Username:</span>
              <p className="text-gray-900 dark:text-white">
                {user?.user_metadata?.twitter_username ? (
                  <a 
                    href={`https://twitter.com/${user.user_metadata.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    @{user.user_metadata.twitter_username}
                  </a>
                ) : (
                  <span className="text-yellow-600">Not linked</span>
                )}
              </p>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Wallet Address:</span>
              <p className="text-gray-900 dark:text-white">
                {user?.user_metadata?.wallet_address ? (
                  <a 
                    href={`https://sepolia.etherscan.io/address/${user.user_metadata.wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    {user.user_metadata.wallet_address.slice(0, 6)}...{user.user_metadata.wallet_address.slice(-4)}
                  </a>
                ) : (
                  <span className="text-yellow-600">Not connected</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {!user?.user_metadata?.twitter_username && (
              <button
                onClick={() => router.push('/auth/twitter-link')}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Link Twitter Account
              </button>
            )}
            
            {!user?.user_metadata?.wallet_address && (
              <button
                onClick={() => router.push('/auth/wallet-connect')}
                className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                Connect Wallet
              </button>
            )}
            
            {user?.user_metadata?.wallet_address && (
              <button
                onClick={() => router.push('/dashboard/wallet-settings')}
                className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                Manage Wallet
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">CDO Listings</h2>
          <p className="text-gray-600 dark:text-gray-400">
            No CDO listings are available yet. Check back soon!
          </p>
        </div>
      </main>
    </div>
  )
} 