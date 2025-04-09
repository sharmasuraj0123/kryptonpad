'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase-browser'
import { countries } from 'countries-list'
import Image from 'next/image'

export default function SignupForm() {
  const router = useRouter()
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Format countries for dropdown
  const countryOptions = Object.entries(countries).map(([code, country]) => ({
    value: code,
    label: country.name
  })).sort((a, b) => a.label.localeCompare(b.label))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.country) {
      setError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    handleSignup()
  }

  const handleSignup = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // First register the user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            country: formData.country,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Also insert into the users table to ensure country is saved
      if (data?.user) {
        try {
          const { error: insertError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: formData.email,
              name: formData.name,
              country: formData.country,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            })
          
          if (insertError) {
            console.error('Error updating users table:', insertError)
            // Don't block the signup process if this fails
          }
        } catch (tableErr) {
          console.error('Exception updating users table:', tableErr)
        }
      }

      // Move to step 2 - email verification
      setFormStep(2)
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!formData.email) return
    
    setLoading(true)
    const supabase = createClient()
    
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
      })
      
      if (resendError) {
        setError(resendError.message)
      } else {
        setError('')
        alert('Verification email resent! Please check your inbox.')
      }
    } catch (err) {
      console.error('Error resending verification:', err)
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Sign Up Form
  if (formStep === 1) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-black rounded-lg text-white">
        <h1 className="text-2xl font-bold text-center mb-6">KRYPTON PAD</h1>
        <p className="text-center text-gray-400 mb-6">Participate in the most anticipated IDO's</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleNextStep} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 pl-10 bg-gray-900/60 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-500 text-white"
                placeholder="David"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                💼
              </span>
            </div>
            
            <div className="relative">
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 pl-10 bg-gray-900/60 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white appearance-none"
              >
                <option value="">Select your country</option>
                {countryOptions.map(country => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🌐
              </span>
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                ▼
              </span>
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 pl-10 bg-gray-900/60 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-500 text-white"
                placeholder="your@email.com"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                ✉️
              </span>
            </div>
            
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pl-10 bg-gray-900/60 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white"
                placeholder="••••••••••••"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔒
              </span>
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                ✓
              </span>
            </div>
            
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pl-10 bg-gray-900/60 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white"
                placeholder="Enter your password"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔒
              </span>
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                👁️
              </span>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            Or Signup With
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              type="button"
              className="flex items-center justify-center py-2 px-4 bg-transparent border border-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              <span className="mr-2">G</span>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center py-2 px-4 bg-transparent border border-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              <span className="mr-2">X</span>
              Twitter
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-purple-400 hover:text-purple-300">
                Sign In
              </a>
            </p>
          </div>
        </form>
        
        <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 mt-6 rounded-full"></div>
      </div>
    )
  }
  
  // Step 2: Email Verification
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-black rounded-lg text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">KRYPTON PAD</h1>
        <h2 className="text-xl font-semibold mb-6">Verify your email</h2>
        <div className="mb-6">
          <svg 
            className="w-16 h-16 text-purple-500 mx-auto mb-4" 
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
          <p className="text-gray-400">
            We sent a verification email to <span className="font-semibold text-white">{formData.email}</span>
          </p>
          <p className="text-gray-400 mt-2">
            Please check your inbox and click the verification link to continue.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <button
          onClick={handleResendVerification}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Resend verification email'}
        </button>
        
        <div className="mt-4">
          <button 
            onClick={() => setFormStep(1)}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            ← Back to signup
          </button>
        </div>
      </div>
      
      <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 mt-6 rounded-full"></div>
    </div>
  )
} 