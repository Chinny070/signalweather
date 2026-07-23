'use client';

import { useWallet } from './WalletProvider';
import { formatAddress } from '@/lib/formatting/climate';

export function WalletButton() {
  const { address, isCorrectNetwork, isConnecting, connect, switchNetwork } = useWallet();

  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="px-4 py-2 text-sm font-medium bg-surface-raised border border-border text-foreground hover:bg-border transition-colors clip-corner"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <button
        onClick={switchNetwork}
        className="px-4 py-2 text-sm font-medium bg-critical/10 border border-critical/30 text-critical hover:bg-critical/20 transition-colors clip-corner"
      >
        Switch to StudioNet
      </button>
    );
  }

  return (
    <div className="px-4 py-2 text-sm font-data bg-surface-raised border border-border text-muted clip-corner">
      {formatAddress(address)}
    </div>
  );
}
