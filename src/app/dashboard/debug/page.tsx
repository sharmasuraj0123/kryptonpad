'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase-browser'
import { useRouter } from 'next/navigation'

export default function DebugPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [apiResponse, setApiResponse] = useState<any>(null)

  useEffect(() => {
    async function getData() {
      setLoading(true)
      
      try {
        // Get user from client-side
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Error fetching user:', userError)
          return
        }
        
        setUser(user)
        
        if (user) {
          // Try to get user from database
          const { data: dbUserData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (dbError) {
            console.error('Error fetching DB user:', dbError)
          } else {
            setDbUser(dbUserData)
          }
        }
        
        // Also check the API
        const apiRes = await fetch('/api/check-auth')
        const apiData = await apiRes.json()
        setApiResponse(apiData)
        
      } catch (err) {
        console.error('Debug error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    getData()
  }, [])

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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading debug data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Authentication Debug</h1>
        
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Auth User</h2>
            {user ? (
              <pre className="bg-gray-100 p-4 rounded dark:bg-gray-700 dark:text-gray-300 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            ) : (
              <p className="text-red-500">Not authenticated</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Database User</h2>
            {dbUser ? (
              <pre className="bg-gray-100 p-4 rounded dark:bg-gray-700 dark:text-gray-300 overflow-auto">
                {JSON.stringify(dbUser, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No database record found</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">API Response</h2>
            {apiResponse ? (
              <pre className="bg-gray-100 p-4 rounded dark:bg-gray-700 dark:text-gray-300 overflow-auto">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No API response</p>
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
            
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 