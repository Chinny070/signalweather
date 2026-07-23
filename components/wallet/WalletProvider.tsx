'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { getAccount, getCurrentChainId, switchToStudioNet } from '@/lib/genlayer/client';
import { STUDIONET } from '@/lib/genlayer/network';

interface WalletState {
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletState>({
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  isConnecting: false,
  connect: async () => {},
  switchNetwork: async () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isCorrectNetwork = chainId === STUDIONET.chainId;

  const refreshState = useCallback(async () => {
    const acc = await getAccount().catch(() => null);
    const chain = await getCurrentChainId().catch(() => null);
    setAddress(acc);
    setChainId(chain);
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const acc = await getAccount();
      setAddress(acc);
      const chain = await getCurrentChainId();
      setChainId(chain);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    const switched = await switchToStudioNet();
    if (switched) {
      const chain = await getCurrentChainId();
      setChainId(chain);
    }
  }, []);

  useEffect(() => {
    refreshState();
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccounts = () => refreshState();
      const handleChain = () => refreshState();
      window.ethereum.on('accountsChanged', handleAccounts);
      window.ethereum.on('chainChanged', handleChain);
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccounts);
        window.ethereum?.removeListener('chainChanged', handleChain);
      };
    }
  }, [refreshState]);

  return (
    <WalletContext.Provider value={{ address, chainId, isCorrectNetwork, isConnecting, connect, switchNetwork }}>
      {children}
    </WalletContext.Provider>
  );
}
