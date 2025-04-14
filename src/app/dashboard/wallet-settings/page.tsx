'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase-browser'
import WalletConnectButton from '@/components/WalletConnectButton'
import ThirdwebWrapper from '@/components/ThirdwebWrapper'

export default function WalletSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchUserData() {
      const supabase = createClient()
      
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !currentUser) {
          setError('Failed to get user information. Please log in again.')
          router.push('/login')
          return
        }
        
        setUser(currentUser)
        setWalletAddress(currentUser.user_metadata?.wallet_address || null)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('An unexpected error occurred. Please try again.')
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [router])

  // Handle wallet address changes from the WalletConnectButton
  const handleWalletAddressChange = (address: string | null) => {
    setWalletAddress(address)
    
    if (address) {
      setSuccess('Wallet connected successfully!')
      setTimeout(() => setSuccess(null), 3000)
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Wallet Settings</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Wallet</h2>
          
          <div className="mb-6">
            <div className="p-4 bg-gray-100 rounded-lg dark:bg-gray-700">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Current Wallet Address:</p>
              <p className="text-gray-900 dark:text-white overflow-auto break-words">
                {walletAddress || 'No wallet connected'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <ThirdwebWrapper>
              <WalletConnectButton 
                onWalletAddressChange={handleWalletAddressChange} 
                buttonLabel={walletAddress ? "Change Wallet" : "Connect Wallet"}
                className="inline-block"
                userId={user?.id}
              />
            </ThirdwebWrapper>
            
            {walletAddress && (
              <button
                onClick={async () => {
                  try {
                    // Save wallet address to both auth metadata and users table
                    const response = await fetch('/api/admin-update-wallet', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ 
                        walletAddress, 
                        userId: user?.id 
                      }),
                    });
                    
                    if (response.ok) {
                      setSuccess('Wallet address saved successfully!');
                    } else {
                      const data = await response.json();
                      setError(`Failed to save: ${data.error || 'Unknown error'}`);
                    }
                  } catch (err) {
                    console.error('Error saving wallet:', err);
                    setError('Failed to save wallet address. Please try again.');
                  }
                  
                  setTimeout(() => {
                    setSuccess(null);
                    setError(null);
                  }, 3000);
                }}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Wallet Address
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
} 