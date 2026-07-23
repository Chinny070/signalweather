'use client';

import { use } from 'react';
import { explorerTxUrl } from '@/lib/genlayer/network';

export default function AssessmentPage({ params }: { params: Promise<{ transactionHash: string }> }) {
  const { transactionHash } = use(params);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-4">Assessment Transaction</h1>

      <div className="instrument-band p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-muted mb-1">Transaction Hash</p>
          <p className="font-data text-sm break-all">{transactionHash}</p>
        </div>

        <a
          href={explorerTxUrl(transactionHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 text-sm font-medium bg-consensus/10 border border-consensus/30 text-consensus hover:bg-consensus/20 transition-colors clip-corner"
        >
          View on GenLayer Explorer →
        </a>

        <p className="mt-6 text-xs text-muted">
          Assessment transactions contain the full validator consensus process. The explorer
          shows the transaction status, execution result, and finality state.
        </p>
      </div>
    </div>
  );
}
