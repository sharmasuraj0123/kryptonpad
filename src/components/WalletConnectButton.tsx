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