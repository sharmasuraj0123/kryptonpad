'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase-browser'
import { useRouter } from 'next/navigation'

export default function ConnectTest() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('Failed to get user:', userError?.message || 'Not authenticated')
          setLoading(false)
          return
        }
        
        setUser(user)
        
        // Try to get user from database
        try {
          const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (dbError) {
            console.error('Error fetching DB user:', dbError)
          } else {
            setDbUser(userData)
          }
        } catch (err) {
          console.error('Error fetching user data:', err)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const connectAndSaveWallet = async () => {
    if (!walletAddress || !user) return
    
    setSaving(true)
    setMessage('')
    
    try {
      const supabase = createClient()
      
      // First update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          wallet_address: walletAddress,
          user_type: 'wallet'
        }
      })
      
      if (authError) {
        setMessage(`Error updating auth: ${authError.message}`)
        setSaving(false)
        return
      }
      
      // Then update database user
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          wallet_address: walletAddress,
          user_type: 'wallet',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        
      if (dbError) {
        setMessage(`Error updating database: ${dbError.message}`)
      } else {
        setMessage('Wallet successfully connected!')
        
        // Refresh data
        const { data: { user: updatedUser } } = await supabase.auth.getUser()
        if (updatedUser) {
          setUser(updatedUser)
        }
        
        const { data: updatedDbUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (updatedDbUser) {
          setDbUser(updatedDbUser)
        }
      }
    } catch (err) {
      console.error('Error saving wallet:', err)
      setMessage('An unexpected error occurred')
    } finally {
      setSaving(false)
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
  
  if (!user) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be logged in to access this page.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Simple Wallet Connection Test</h1>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Auth User Info</h2>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Wallet:</strong> {user.user_metadata?.wallet_address || 'Not connected'}</p>
              <p><strong>User Type:</strong> {user.user_metadata?.user_type || 'Not set'}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Database User Info</h2>
            {dbUser ? (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>ID:</strong> {dbUser.id}</p>
                <p><strong>Wallet:</strong> {dbUser.wallet_address || 'Not set'}</p>
                <p><strong>User Type:</strong> {dbUser.user_type || 'Not set'}</p>
                <p><strong>Updated:</strong> {dbUser.updated_at ? new Date(dbUser.updated_at).toLocaleString() : 'Never'}</p>
              </div>
            ) : (
              <p className="text-gray-500">No database record found</p>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Connect Wallet</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <button
            onClick={connectAndSaveWallet}
            disabled={saving || !walletAddress.trim()}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {saving ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
} 