'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase-browser'
import Link from 'next/link'

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log('Login form submitted')
    setError('')
    setLoading(true)

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting to sign in with Supabase')
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      console.log('Sign in response:', { data, error: signInError })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      // Set local storage flag for remember me (to be used for auto-login)
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }

      console.log('Login successful, redirecting to dashboard')
      // Redirect to dashboard after login
      router.replace('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-900 rounded-xl shadow-lg">
      {error && (
        <div className="mb-6 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            placeholder="Your password"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded bg-gray-800"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  )
} 