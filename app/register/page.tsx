'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useWallet } from '@/components/wallet/WalletProvider';
import { TransactionStatus, type TxPhase } from '@/components/tx/TransactionStatus';
import { registerCommunity, getCounts } from '@/lib/contract';

const DEFAULT_POSTURE_POLICY = JSON.stringify({
  stable: 'normal',
  strengthening: 'normal',
  strained: 'observe',
  eroding: 'heightened_review',
  fragile: 'cooldown',
  critical: 'emergency',
  inconclusive: 'observe',
});

const schema = z.object({
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(48, 'Slug must be 48 characters or fewer')
    .regex(/^[a-z0-9][a-z0-9\-]*[a-z0-9]$/, 'Lowercase alphanumeric and hyphens only, cannot start or end with hyphen'),
  name: z.string().min(1, 'Name is required').max(120, 'Name must be 120 characters or fewer'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or fewer'),
  governanceUrl: z.string().url('Must be a valid URL'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { address, isCorrectNetwork, connect, switchNetwork, isConnecting } = useWallet();
  const [txPhase, setTxPhase] = useState<TxPhase | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txError, setTxError] = useState<string | undefined>();
  const [createdId, setCreatedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setTxPhase('preparing');
    setTxHash(undefined);
    setTxError(undefined);
    setCreatedId(null);

    try {
      setTxPhase('wallet_confirm');
      const outcome = await registerCommunity(
        data.slug,
        data.name,
        data.description,
        data.governanceUrl,
        DEFAULT_POSTURE_POLICY,
      );

      setTxHash(outcome.hash);

      if (outcome.success) {
        setTxPhase('accepted');
        const counts = await getCounts();
        setCreatedId(String(counts.communities));
      } else {
        setTxPhase('error');
        setTxError(outcome.error ?? 'Transaction failed');
      }
    } catch (err) {
      setTxPhase('error');
      setTxError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* ── HEADER ── */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2 font-data">
          Community Registration
        </p>
        <h1 className="font-display text-3xl text-foreground">
          Register a new community
        </h1>
        <div className="mt-3 h-px bg-border" />
      </div>

      {/* ── WALLET GUARDS ── */}
      {!address && (
        <div className="instrument-band p-6 mb-8">
          <p className="text-sm text-muted mb-4">
            Connect your wallet to register a community on-chain.
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest font-medium clip-corner hover:bg-stable transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      )}

      {address && !isCorrectNetwork && (
        <div className="instrument-band p-6 mb-8 border-strained/30">
          <p className="text-sm text-strained mb-4">
            Wrong network detected. Switch to GenLayer StudioNet to continue.
          </p>
          <button
            onClick={switchNetwork}
            className="bg-strained text-background px-5 py-2.5 text-xs uppercase tracking-widest font-medium clip-corner hover:opacity-90 transition-opacity"
          >
            Switch Network
          </button>
        </div>
      )}

      {/* ── FORM ── */}
      {address && isCorrectNetwork && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Slug */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Slug
            </label>
            <input
              {...register('slug')}
              placeholder="my-community"
              className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data placeholder:text-muted/50 focus:outline-none focus:border-stable/50 transition-colors"
            />
            {errors.slug && (
              <p className="mt-1.5 text-xs text-critical">{errors.slug.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Name
            </label>
            <input
              {...register('name')}
              placeholder="My Community DAO"
              className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-stable/50 transition-colors"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-critical">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe the community, its governance scope, and what this registration covers."
              className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-stable/50 transition-colors resize-none"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-critical">{errors.description.message}</p>
            )}
          </div>

          {/* Governance URL */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Governance URL
            </label>
            <input
              {...register('governanceUrl')}
              placeholder="https://forum.example.com"
              className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data placeholder:text-muted/50 focus:outline-none focus:border-stable/50 transition-colors"
            />
            {errors.governanceUrl && (
              <p className="mt-1.5 text-xs text-critical">{errors.governanceUrl.message}</p>
            )}
          </div>

          {/* Policy preview */}
          <div className="instrument-band p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Default Posture Policy
            </p>
            <pre className="text-xs font-data text-foreground/70 overflow-x-auto whitespace-pre">
              {JSON.stringify(JSON.parse(DEFAULT_POSTURE_POLICY), null, 2)}
            </pre>
          </div>

          <div className="h-px bg-border" />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || txPhase === 'wallet_confirm' || txPhase === 'submitted' || txPhase === 'pending_consensus'}
            className="bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest font-medium clip-corner hover:bg-stable transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Register Community'}
          </button>

          {/* Tx status */}
          {txPhase && (
            <div className="mt-4">
              <TransactionStatus phase={txPhase} hash={txHash} error={txError} />
            </div>
          )}

          {/* Success link */}
          {txPhase === 'accepted' && createdId && (
            <div className="mt-4 instrument-band p-4 border-stable/30">
              <p className="text-sm text-stable mb-3">
                Community registered successfully.
              </p>
              <Link
                href={`/manage/${createdId}`}
                className="text-xs uppercase tracking-widest text-stable hover:underline font-data"
              >
                Go to Management Dashboard →
              </Link>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
