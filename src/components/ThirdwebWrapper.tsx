'use client';

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Sepolia } from "@thirdweb-dev/chains";
import { ReactNode } from "react";

interface ThirdwebWrapperProps {
  children: ReactNode;
}

export default function ThirdwebWrapper({ children }: ThirdwebWrapperProps) {
  return (
    <ThirdwebProvider 
      activeChain={Sepolia} 
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      {children}
    </ThirdwebProvider>
  );
} 