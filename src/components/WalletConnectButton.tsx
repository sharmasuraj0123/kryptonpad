'use client';

import { ConnectWallet } from "@thirdweb-dev/react";

export default function WalletConnectButton() {
  return (
    <ConnectWallet 
      theme="dark"
      btnTitle="Connect Wallet"
      modalTitle="Connect Your Wallet"
    />
  );
} 