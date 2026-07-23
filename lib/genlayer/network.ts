import { studionet } from 'genlayer-js/chains';

export const STUDIONET = {
  chainId: studionet.id,
  chainIdHex: '0x' + studionet.id.toString(16).toUpperCase(),
  chainName: studionet.name,
  nativeCurrency: studionet.nativeCurrency,
  rpcUrls: [studionet.rpcUrls.default.http[0]],
  blockExplorerUrls: studionet.blockExplorers
    ? [studionet.blockExplorers.default.url]
    : ['https://explorer-studio.genlayer.com'],
} as const;

export const EXPLORER_BASE = STUDIONET.blockExplorerUrls[0];

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_BASE}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${EXPLORER_BASE}/address/${address}`;
}
