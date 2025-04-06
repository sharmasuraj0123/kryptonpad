'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase-browser'
import { ThirdwebProvider } from 'thirdweb/react'
import { sepolia } from 'thirdweb/chains'
import WalletConnectButton from '@/components/WalletConnectButton'

export default function WalletConnect() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [savedSuccessfully, setSavedSuccessfully] = useState(false)
  
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
        
        // Check if wallet is already connected
        if (currentUser.user_metadata?.wallet_address) {
          setWalletAddress(currentUser.user_metadata.wallet_address)
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

  // Handle wallet address changes from the WalletConnectButton
  const handleWalletAddressChange = (address: string | null) => {
    setWalletAddress(address);
    
    if (address) {
      // If wallet is connected and address is saved, we'll get a success message
      setSavedSuccessfully(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      setSavedSuccessfully(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect your wallet</h1>
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-purple-500 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 7h-1V6c0-1.1-.9-2-2-2H8C6.9 4 6 4.9 6 6v1H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-1 10H6V9h12v8zM8 6h8v1H8V6z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your wallet to complete the setup of your profile.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              This allows you to participate in IDOs and manage your tokens.
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {savedSuccessfully && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
              Wallet connected successfully! Redirecting to dashboard...
            </div>
          )}
          
          <div className="mb-6">
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700 flex flex-col items-center">
              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                {walletAddress 
                  ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` 
                  : 'No wallet connected'}
              </p>
              
              <ThirdwebProvider>
                <WalletConnectButton 
                  onWalletAddressChange={handleWalletAddressChange}
                  buttonLabel={walletAddress ? "Change Wallet" : "Connect Wallet"}
                  className="w-full"
                  userId={user?.id}
                />
              </ThirdwebProvider>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              {walletAddress ? 'Continue to Dashboard' : 'Skip for now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 