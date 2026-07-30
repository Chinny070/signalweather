'use client';

import { explorerTxUrl } from '@/lib/genlayer/network';

export type TxPhase = 'preparing' | 'wallet_confirm' | 'submitted' | 'pending_consensus' | 'accepted' | 'undetermined' | 'pending_long' | 'error';

const PHASE_LABELS: Record<TxPhase, string> = {
  preparing: 'Preparing transaction...',
  wallet_confirm: 'Confirm in wallet',
  submitted: 'Transaction submitted',
  pending_consensus: 'Pending consensus...',
  accepted: 'Accepted',
  undetermined: 'Undetermined',
  pending_long: 'Assessment in progress — validators are fetching sources and evaluating. This may take a few minutes.',
  error: 'Transaction failed',
};

interface TransactionStatusProps {
  phase: TxPhase;
  hash?: string;
  error?: string;
}

export function TransactionStatus({ phase, hash, error }: TransactionStatusProps) {
  const isActive = ['preparing', 'wallet_confirm', 'submitted', 'pending_consensus', 'pending_long'].includes(phase);
  const isSuccess = phase === 'accepted';
  const isError = phase === 'error' || phase === 'undetermined';

  return (
    <div className={`instrument-band p-4 ${isError ? 'border-critical/30' : isSuccess ? 'border-stable/30' : ''}`}>
      <div className="flex items-center gap-3">
        {isActive && (
          <div className="w-2 h-2 rounded-full bg-consensus animate-pulse" />
        )}
        {isSuccess && (
          <div className="w-2 h-2 rounded-full bg-stable" />
        )}
        {isError && (
          <div className="w-2 h-2 rounded-full bg-critical" />
        )}
        <span className="text-sm">{PHASE_LABELS[phase]}</span>
      </div>

      {error && (
        <p className="mt-2 text-xs text-critical">{error}</p>
      )}

      {hash && (
        <a
          href={explorerTxUrl(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-data text-consensus hover:underline"
        >
          View on explorer →
        </a>
      )}
    </div>
  );
}
