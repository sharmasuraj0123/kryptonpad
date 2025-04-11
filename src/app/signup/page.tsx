'use client';

import { useEffect, useState } from 'react';
import SignupForm from '@/components/auth/SignupForm';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && !error) {
          // User is already logged in, redirect to dashboard
          router.replace('/dashboard');
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
        <p className="text-xl text-gray-400">Create your account</p>
      </div>
      
      <SignupForm />

      <div className="mt-8 text-gray-400 text-center">
        <p>Already have an account?</p>
        <Link 
          href="/login" 
          className="mt-2 inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium rounded-full"
        >
          Log in
        </Link>
      </div>
    </main>
  );
} 