'use client';

import React, { useState } from 'react';
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { base, bsc, sepolia } from 'thirdweb/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize QueryClient outside of component
const queryClient = new QueryClient();

export default function WalletDemo() {
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Initialize client with your clientId from .env
  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 relative">
        <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Wallet Connect Demo
        </h1>
        
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-sm border border-indigo-100">
            <p className="text-center text-lg font-medium text-gray-900">
              {userAddress 
                ? `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}` 
                : 'No wallet connected'}
            </p>
          </div>
          
          <QueryClientProvider client={queryClient}>
            <ThirdwebProvider>
              <ConnectButton 
                client={client}
                theme="dark"
                chains={[base, bsc, sepolia]}
                onConnect={(wallet) => {
                  if (wallet && wallet.getAccount) {
                    const account = wallet.getAccount();
                    setUserAddress(account.address);
                  }
                }}
              />
            </ThirdwebProvider>
          </QueryClientProvider>
        </div>
      </div>
    </div>
  );
} 