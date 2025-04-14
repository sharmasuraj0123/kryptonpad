'use client';

import { useState, useEffect } from 'react';
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { base, bsc, sepolia } from 'thirdweb/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize QueryClient outside of component to prevent re-initialization
const queryClient = new QueryClient();

interface NewWalletConnectProps {
  onWalletAddressChange?: (address: string | null) => void;
  buttonLabel?: string;
  className?: string;
  userId?: string;
}

export default function NewWalletConnect({
  onWalletAddressChange,
  buttonLabel = "Connect Wallet",
  className = "",
  userId,
}: NewWalletConnectProps) {
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Initialize client with your clientId
  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });

  useEffect(() => {
    // Call our API to update wallet address in profiles table
    const updateWalletAddress = async () => {
      if (userAddress) {
        try {
          // Update wallet address in profiles and user tables
          const response = await fetch('/api/profile-wallet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress: userAddress }),
          });
          
          if (!response.ok) {
            console.error('Failed to update wallet address:', await response.text());
          }
        } catch (error) {
          console.error('Error updating wallet address:', error);
        }
      }
    };

    if (userAddress) {
      updateWalletAddress();
    }
    
    // Also call the onWalletAddressChange callback if provided
    if (onWalletAddressChange) {
      onWalletAddressChange(userAddress);
    }
  }, [userAddress, onWalletAddressChange]);

  return (
    <div className={className}>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider>
          <ConnectButton 
            client={client}
            theme="dark"
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
  );
} 