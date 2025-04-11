'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase-browser'
import { useRouter } from 'next/navigation'
import CDOListings from '@/components/CDOListings'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(250)
  const [showProfilePanel, setShowProfilePanel] = useState(false)

  useEffect(() => {
    async function getUser() {
      setLoading(true)
      const supabase = createClient()
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.log('User not authenticated, redirecting to login')
          router.replace('/login')
          return
        }
        
        setUser(user)
      } catch (err) {
        console.error('Error fetching user:', err)
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If somehow we get here without a user, redirect to login
  if (!user) {
    router.replace('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="bg-black border-b border-gray-800 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div 
              onClick={() => setShowProfilePanel(!showProfilePanel)}
              className="w-8 h-8 rounded-full bg-gray-700 mr-3 flex items-center justify-center cursor-pointer"
            >
              {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-4 w-4">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 4V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 7V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="h-4 w-4">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center bg-gray-800 rounded-full px-3 py-1">
              <span className="text-white">$ {balance}</span>
              <div className="ml-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">XC</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Profile Panel (Slide Down) */}
      {showProfilePanel && (
        <div className="bg-gray-900 border-b border-gray-800 p-4 animate-slideDown">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Profile</h2>
              <button
                onClick={handleSignOut}
                className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-full"
              >
                Sign out
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <span className="text-gray-400">Email:</span>
                <span>{user?.email}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <span className="text-gray-400">Name:</span>
                <span>{user?.user_metadata?.name || 'Not provided'}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <span className="text-gray-400">Country:</span>
                <span>{user?.user_metadata?.country || 'Not provided'}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <span className="text-gray-400">Twitter:</span>
                {user?.user_metadata?.twitter_username ? (
                  <a 
                    href={`https://twitter.com/${user.user_metadata.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    @{user.user_metadata.twitter_username}
                  </a>
                ) : (
                  <span className="text-yellow-500">Not linked</span>
                )}
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <span className="text-gray-400">Wallet:</span>
                {user?.user_metadata?.wallet_address ? (
                  <a 
                    href={`https://sepolia.etherscan.io/address/${user.user_metadata.wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline"
                  >
                    {user.user_metadata.wallet_address.slice(0, 6)}...{user.user_metadata.wallet_address.slice(-4)}
                  </a>
                ) : (
                  <span className="text-yellow-500">Not connected</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {!user?.user_metadata?.twitter_username && (
                  <button
                    onClick={() => router.push('/auth/twitter-link')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full"
                  >
                    Link Twitter
                  </button>
                )}
                
                {!user?.user_metadata?.wallet_address && (
                  <button
                    onClick={() => router.push('/auth/wallet-connect')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-full"
                  >
                    Connect Wallet
                  </button>
                )}
                
                {user?.user_metadata?.wallet_address && (
                  <button
                    onClick={() => router.push('/dashboard/wallet-settings')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-full"
                  >
                    Manage Wallet
                  </button>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-800">
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout from KryptonPad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="m-4 p-3 bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-xl">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-yellow-500 mr-3 flex items-center justify-center text-black font-bold">
            D
          </div>
          <div className="flex-1">
            <span className="font-semibold">David earn </span>
            <span className="inline-flex items-center">
              <div className="w-4 h-4 inline-block mr-1 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">Y</span>
              </div>
              20,000
            </span>
            <span className="font-semibold"> in Dicing</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-black">
            &gt;
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 m-4 rounded-2xl p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Looking to launch your project with KryptonPad?</h2>
          <p className="text-white/80">ease & generate excitement.</p>
          <button className="mt-4 bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-4 py-2 rounded-full font-semibold">
            Learn More
          </button>
        </div>
      </div>
      
      <main className="px-4 py-4">
        <CDOListings />
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-gray-800 flex justify-around items-center px-6">
        <button className="flex flex-col items-center justify-center text-purple-500">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-gray-500">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs">IDO</span>
        </button>
        <button className="flex flex-col items-center justify-center text-gray-500">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-xs">Pools</span>
        </button>
        <button 
          onClick={() => setShowProfilePanel(!showProfilePanel)} 
          className={`flex flex-col items-center justify-center ${showProfilePanel ? 'text-purple-500' : 'text-gray-500'}`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M6 21V19C6 17.8954 6.89543 17 8 17H16C17.1046 17 18 17.8954 18 19V21" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  )
} 