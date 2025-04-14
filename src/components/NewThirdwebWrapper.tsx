'use client';

import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { base, bsc, sepolia } from 'thirdweb/chains';
import { ReactNode } from "react";

interface NewThirdwebWrapperProps {
  children: ReactNode;
}

export default function NewThirdwebWrapper({ children }: NewThirdwebWrapperProps) {
  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
  });

  return (
    <ThirdwebProvider client={client}>
      {children}
    </ThirdwebProvider>
  );
} 