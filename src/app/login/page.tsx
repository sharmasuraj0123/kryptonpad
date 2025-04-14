'use client';

import { useEffect, useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { createClient } from '@/utils/supabase-browser';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        // Create a client that will use our persistence settings
        const supabase = createClient();
        
        // Try to get the user - this will try to refresh the session if needed
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && !error) {
          console.log('User is already logged in, redirecting to dashboard');
          router.replace('/dashboard');
        } else {
          // If no valid session but remember me was set, try once more with session refresh
          const rememberMe = typeof window !== 'undefined' && localStorage.getItem('rememberMe') === 'true';
          if (rememberMe) {
            console.log('Attempting to refresh session for remembered user');
            const { data: refreshData } = await supabase.auth.refreshSession();
            
            if (refreshData.session) {
              console.log('Session refreshed successfully, redirecting to dashboard');
              router.replace('/dashboard');
            } else {
              // Clear remember me if session refresh failed
              localStorage.removeItem('rememberMe');
              console.log('Could not refresh session');
            }
          }
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 mb-2">KryptonPad</h1>
        <p className="text-xl text-gray-400">Log in to your account</p>
      </div>
      
      <LoginForm />

      <div className="mt-8 text-gray-400 text-center">
        <p>Don't have an account yet?</p>
        <Link 
          href="/" 
          className="mt-2 inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full"
        >
          Sign up now
        </Link>
      </div>
    </main>
  );
} 