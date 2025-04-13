'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          KryptonPad
        </Link>
        <div className="flex gap-4">
          <Link href="/auth/wallet-connect" className="hover:text-gray-600">
            Connect Wallet
          </Link>
          <Link href="/auth/twitter-link" className="hover:text-gray-600">
            Link Twitter
          </Link>
        </div>
      </div>
    </nav>
  );
} 