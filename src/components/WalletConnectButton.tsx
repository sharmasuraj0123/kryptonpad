'use client';

import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { useEffect } from "react";

interface WalletConnectButtonProps {
  onWalletAddressChange?: (address: string | null) => void;
  buttonLabel?: string;
  className?: string;
  userId?: string;
}

export default function WalletConnectButton({
  onWalletAddressChange,
  buttonLabel = "Connect Wallet",
  className = "",
  userId,
}: WalletConnectButtonProps) {
  const address = useAddress();

  useEffect(() => {
    // Call our API to update wallet address in profiles table
    const updateWalletAddress = async () => {
      if (address) {
        try {
          // Update wallet address in profiles and user tables
          const response = await fetch('/api/profile-wallet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress: address }),
          });
          
          if (!response.ok) {
            console.error('Failed to update wallet address:', await response.text());
          }
        } catch (error) {
          console.error('Error updating wallet address:', error);
        }
      }
    };

    if (address) {
      updateWalletAddress();
    }
    
    // Also call the onWalletAddressChange callback if provided
    if (onWalletAddressChange) {
      onWalletAddressChange(address || null);
    }
  }, [address, onWalletAddressChange]);

  return (
    <div className={className}>
      <ConnectWallet 
        theme="dark"
        btnTitle={buttonLabel}
        modalTitle="Connect Your Wallet"
      />
    </div>
  );
} 