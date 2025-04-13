'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase-browser'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { Sepolia } from '@thirdweb-dev/chains'
import WalletConnectButton from '@/components/WalletConnectButton'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wallet settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Wallet Settings</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connected Wallet</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Your currently connected wallet address:</p>
            {walletAddress ? (
              <div className="p-3 bg-gray-100 rounded border border-gray-200 font-mono text-sm break-all text-black">
                {walletAddress}
              </div>
            ) : (
              <p className="text-amber-600">No wallet connected yet.</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700 mb-4">
              {walletAddress 
                ? 'Update your connected wallet address by connecting a different wallet.' 
                : 'Connect your wallet to enable transactions and token management.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <ThirdwebProvider activeChain={Sepolia} clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}>
                <WalletConnectButton 
                  onWalletAddressChange={handleWalletAddressChange} 
                  buttonLabel={walletAddress ? "Change Wallet" : "Connect Wallet"}
                  className="inline-block"
                  userId={user?.id}
                />
              </ThirdwebProvider>
              
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
          
          <p className="text-gray-600 mb-4">
            Your wallet is used for:
          </p>
          
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Participating in token sales and IDOs</li>
            <li>Receiving tokens and rewards</li>
            <li>Authenticating transactions on the platform</li>
            <li>Managing your digital assets</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 