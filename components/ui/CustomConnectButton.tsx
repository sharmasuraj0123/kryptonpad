// components/CustomConnectButton.js
import { ConnectButton } from '@rainbow-me/rainbowkit';

const CustomConnectButton = () => {
  return (
    
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {connected ? (
                  <div className="flex items-center space-x-4">
                    {/* Chain Display with Arrow */}
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="flex items-center bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 8,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 24, height: 24 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                      <span className="ml-2">▼</span>
                    </button>

                    {/* Account Display */}
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                    >
                      {account.displayName}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            );
          }}
        </ConnectButton.Custom>
     
  );
};

export default CustomConnectButton;
