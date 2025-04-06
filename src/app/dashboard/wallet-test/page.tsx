'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase-browser'
import { useRouter } from 'next/navigation'

export default function WalletTest() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [dbUser, setDbUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const supabase = createClient()
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          setMessage('Error loading user: ' + (userError?.message || 'Not authenticated'))
          setLoading(false)
          return
        }
        
        setUser(user)
        if (user.user_metadata?.wallet_address) {
          setWalletAddress(user.user_metadata.wallet_address)
        }
        
        // Try to get user record from database
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (dbError) {
          console.error('Error loading database user:', dbError)
        } else {
          setDbUser(userData)
        }
      } catch (err) {
        console.error('Error:', err)
        setMessage('Unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  const updateWalletAddress = async () => {
    if (!user || !walletAddress.trim()) return
    
    setSaving(true)
    setMessage('')
    
    try {
      const supabase = createClient()
      
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          wallet_address: walletAddress,
          user_type: 'wallet'
        }
      })
      
      if (authError) {
        setMessage('Error updating auth user: ' + authError.message)
        setSaving(false)
        return
      }
      
      // Update users table
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
        setMessage('Error updating database: ' + dbError.message)
      } else {
        setMessage('Wallet address updated successfully!')
        
        // Refresh user data
        const { data: { user: updatedUser } } = await supabase.auth.getUser()
        setUser(updatedUser)
        
        // Refresh database user data
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
      console.error('Update error:', err)
      setMessage('Failed to update wallet address')
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
  
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Wallet Connection Test</h1>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Auth User</h2>
          <div className="overflow-auto max-h-40 bg-gray-100 p-4 rounded dark:bg-gray-700 dark:text-gray-300">
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>Email:</strong> {user?.email || 'None'}</p>
            <p><strong>Wallet Address:</strong> {user?.user_metadata?.wallet_address || 'None'}</p>
            <p><strong>User Type:</strong> {user?.user_metadata?.user_type || 'None'}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Database User</h2>
          {dbUser ? (
            <div className="overflow-auto max-h-40 bg-gray-100 p-4 rounded dark:bg-gray-700 dark:text-gray-300">
              <p><strong>ID:</strong> {dbUser.id || 'None'}</p>
              <p><strong>Wallet Address:</strong> {dbUser.wallet_address || 'None'}</p>
              <p><strong>User Type:</strong> {dbUser.user_type || 'None'}</p>
              <p><strong>Updated At:</strong> {dbUser.updated_at || 'None'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No database record found</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Update Wallet Address</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0x..."
            />
          </div>
          
          <button
            onClick={updateWalletAddress}
            disabled={saving || !walletAddress.trim()}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Wallet Address'}
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
            onClick={() => router.push('/auth/wallet-connect')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
          >
            Go to Wallet Connect
          </button>
        </div>
      </div>
    </div>
  )
} 