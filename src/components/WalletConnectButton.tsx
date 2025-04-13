import React, { useState, useEffect } from 'react';
import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { sepolia } from 'thirdweb/chains';
import { createClient } from '@/utils/supabase-browser';

interface WalletConnectButtonProps {
  onWalletAddressChange?: (address: string | null) => void;
  step?: number;
  setStep?: (step: number) => void;
  setRecipientWalletAddress?: (address: string | null) => void;
  buttonLabel?: string;
  className?: string;
  userId?: string;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onWalletAddressChange,
  step,
  setStep,
  setRecipientWalletAddress,
  buttonLabel = "Connect Wallet",
  className = "",
  userId,
}) => {
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId || null);

  const client = createThirdwebClient({
    clientId: "a32954d2274ff167331b829df4fd8e25",
    secretKey: "4g2lj4uHxzIFSdRwEEDkUjh2-Z_2HMLPIQsDEzn2UMwsSDlm75NPwdffUUiKvdXYEQmb2wKnjNyvgUdOIFGHVg"
  });

  useEffect(() => {
    async function getUserId() {
      if (!userId) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      }
    }
    
    getUserId();
  }, [userId]);

  const handleWalletConnect = (wallet: any) => {
    const address = wallet.getAccount()?.address;
    console.log("Wallet Address", address);
    setConnectedWalletAddress(address || null);
    
    if (onWalletAddressChange) {
      onWalletAddressChange(address || null);
    }
    
    if (step === 2 && setRecipientWalletAddress) {
      setRecipientWalletAddress(address || null);
    }
  };

  const handleWalletDisconnect = () => {
    console.log("Disconnected");
    setConnectedWalletAddress(null);
    
    if (onWalletAddressChange) {
      onWalletAddressChange(null);
    }
    
    if (step === 2 && setRecipientWalletAddress) {
      setRecipientWalletAddress(null);
    }
    
    if (setStep) {
      setStep(2);
    }
  };

  useEffect(() => {
    if (connectedWalletAddress && currentUserId) {
      const saveWalletAddress = async () => {
        try {
          const response = await fetch('/api/admin-update-wallet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              walletAddress: connectedWalletAddress,
              userId: currentUserId
            }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('Failed to save wallet address:', data.error);
          } else {
            console.log('Wallet address saved successfully');
          }
        } catch (error) {
          console.error('Error saving wallet address:', error);
        }
      };
      
      saveWalletAddress();
    }
  }, [connectedWalletAddress, currentUserId]);

  return (
    <div className={className}>
      <ConnectButton 
        client={client}
        theme="light"
        chain={sepolia}
        onConnect={handleWalletConnect}
        onDisconnect={handleWalletDisconnect}
        connectButton={{
          label: buttonLabel
        }}
        connectModal={{
          title: "Connect your wallet",
          size: "compact",
        }}
      />
    </div>
  );
};

export default WalletConnectButton; 