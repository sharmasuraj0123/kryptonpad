'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          setIsLoggedIn(true);
          router.push('/dashboard');
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
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 mb-2">KryptonPad</h1>
          <p className="text-xl text-gray-400">The ultimate platform for CDO listings</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 mx-auto max-w-3xl rounded-2xl p-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Access Exclusive CDO Listings</h2>
            <p className="text-white/80">Join KryptonPad to discover exciting cryptocurrency offerings, connect with projects, and participate in token sales.</p>
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <Link href="/login" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-full transition-colors">
                Log In
              </Link>
              <Link href="/signup" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-lg font-semibold rounded-full transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-gray-900 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Why KryptonPad?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Vetted Projects</h3>
              <p className="text-gray-400 mt-2">All listings are carefully vetted for security and quality</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pink-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Early Access</h3>
              <p className="text-gray-400 mt-2">Get early access to promising token sales</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Exclusive Rewards</h3>
              <p className="text-gray-400 mt-2">Earn rewards by participating in IDOs</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
