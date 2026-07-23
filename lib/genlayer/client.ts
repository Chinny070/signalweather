import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import type { Address } from 'viem';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || '') as Address;

function getReadClient() {
  return createClient({ chain: studionet });
}

function getWriteClient(account: Address) {
  if (!window.ethereum) throw new Error('No wallet found');
  return createClient({
    chain: studionet,
    account,
    provider: window.ethereum,
  });
}

export async function getAccount(): Promise<string | null> {
  if (!window.ethereum) return null;
  try {
    const accounts = (await window.ethereum.request({
      method: 'eth_requestAccounts',
    })) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export async function getCurrentChainId(): Promise<number | null> {
  if (!window.ethereum) return null;
  try {
    const chainId = (await window.ethereum.request({
      method: 'eth_chainId',
    })) as string;
    return parseInt(chainId, 16);
  } catch {
    return null;
  }
}

export async function switchToStudioNet(): Promise<boolean> {
  if (!window.ethereum) return false;
  const chainIdHex = '0x' + studionet.id.toString(16);
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    return true;
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: studionet.name,
              nativeCurrency: studionet.nativeCurrency,
              rpcUrls: [studionet.rpcUrls.default.http[0]],
              blockExplorerUrls: studionet.blockExplorers
                ? [studionet.blockExplorers.default.url]
                : [],
            },
          ],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export interface TxResult {
  hash: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export async function sendTransaction(
  method: string,
  args: string[]
): Promise<TxResult> {
  if (!window.ethereum) throw new Error('No wallet found');
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === ('0x' as Address)) {
    throw new Error('Contract address not configured');
  }

  const account = await getAccount();
  if (!account) throw new Error('No account connected');

  const chainId = await getCurrentChainId();
  if (chainId !== studionet.id) {
    const switched = await switchToStudioNet();
    if (!switched) throw new Error('Failed to switch to StudioNet');
  }

  try {
    const client = getWriteClient(account as Address);
    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: method,
      args,
      value: 0n,
    });
    return { hash: hash as string, status: 'pending' };
  } catch (err: unknown) {
    const error = err as Error;
    return { hash: '', status: 'error', error: error.message };
  }
}

export async function callReadMethod(
  method: string,
  args: string[]
): Promise<string> {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === ('0x' as Address)) {
    throw new Error('Contract address not configured');
  }

  const client = getReadClient();
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
  });
  return result as string;
}

export async function waitForReceipt(
  txHash: string
): Promise<{ status: 'success' | 'error'; data?: unknown }> {
  try {
    const client = getReadClient();
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash as `0x${string}` & { length: 66 },
      retries: 200,
    });
    const status = receipt.status || receipt.statusName;
    if (status === 'ACCEPTED' || status === 'FINALIZED') {
      return { status: 'success', data: receipt };
    }
    if (status === 'CANCELED' || status === 'UNDETERMINED') {
      return { status: 'error', data: receipt };
    }
    return { status: 'success', data: receipt };
  } catch {
    return { status: 'error' };
  }
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
