import CustomConnectButton from "@/components/ui/CustomConnectButton";
import React from "react";

interface WalletConnectModalProps {
  isOpen: boolean;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          To access the Krypton Launchpad, please connect your MetaMask wallet.
          This will enable a secure and personalized experience on the platform.
        </p>
        <CustomConnectButton />
      </div>
    </div>
  );
};

export default WalletConnectModal;
