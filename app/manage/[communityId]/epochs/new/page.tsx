'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWallet } from '@/components/wallet/WalletProvider';
import { TransactionStatus, type TxPhase } from '@/components/tx/TransactionStatus';
import {
  getCommunity, getCommunityEpochIds, getEpoch,
  openEpoch, requestAssessment,
} from '@/lib/contract';
import { formatEpochWindow } from '@/lib/formatting/climate';
import type { Community, Epoch } from '@/lib/genlayer/types';

const schema = z.object({
  label: z.string().min(1, 'Label is required').max(120, 'Label must be 120 characters or fewer'),
  windowStart: z.string().min(1, 'Start date is required'),
  windowEnd: z.string().min(1, 'End date is required'),
  sourceSetId: z.string().min(1, 'Source set is required'),
  previousEpochId: z.string(),
  policyVersion: z.string().min(1, 'Policy version is required'),
}).refine((data) => {
  const start = new Date(data.windowStart).getTime();
  const end = new Date(data.windowEnd).getTime();
  return end > start;
}, { message: 'End date must be after start date', path: ['windowEnd'] });

type FormData = z.infer<typeof schema>;

export default function NewEpochPage() {
  const params = useParams<{ communityId: string }>();
  const communityId = params.communityId;
  const { address, isCorrectNetwork, connect, switchNetwork, isConnecting } = useWallet();

  const [community, setCommunity] = useState<Community | null>(null);
  const [epochs, setEpochs] = useState<Epoch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create epoch tx
  const [createTxPhase, setCreateTxPhase] = useState<TxPhase | null>(null);
  const [createTxHash, setCreateTxHash] = useState<string | undefined>();
  const [createTxError, setCreateTxError] = useState<string | undefined>();
  const [createdEpochId, setCreatedEpochId] = useState<string | null>(null);

  // Request assessment tx
  const [assessTxPhase, setAssessTxPhase] = useState<TxPhase | null>(null);
  const [assessTxHash, setAssessTxHash] = useState<string | undefined>();
  const [assessTxError, setAssessTxError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      previousEpochId: '0',
      policyVersion: '1',
    },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const comm = await getCommunity(communityId);
      setCommunity(comm);

      const epochIds = await getCommunityEpochIds(communityId);
      const epochList = await Promise.all(
        epochIds.map((id) => getEpoch(String(id)))
      );
      setEpochs(epochList.reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function onSubmit(data: FormData) {
    const startTs = String(Math.floor(new Date(data.windowStart).getTime() / 1000));
    const endTs = String(Math.floor(new Date(data.windowEnd).getTime() / 1000));

    setCreateTxPhase('preparing');
    setCreateTxHash(undefined);
    setCreateTxError(undefined);
    setCreatedEpochId(null);

    try {
      setCreateTxPhase('wallet_confirm');
      const outcome = await openEpoch(
        communityId,
        data.label,
        startTs,
        endTs,
        data.sourceSetId,
        data.previousEpochId || '0',
        data.policyVersion,
      );
      setCreateTxHash(outcome.hash);

      if (outcome.success) {
        setCreateTxPhase('accepted');
        setCreatedEpochId(outcome.hash);
        loadData();
      } else {
        setCreateTxPhase('error');
        setCreateTxError(outcome.error ?? 'Transaction failed');
      }
    } catch (err) {
      setCreateTxPhase('error');
      setCreateTxError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function onRequestAssessment(epochId: string) {
    setAssessTxPhase('preparing');
    setAssessTxHash(undefined);
    setAssessTxError(undefined);

    try {
      setAssessTxPhase('wallet_confirm');
      const outcome = await requestAssessment(epochId);
      setAssessTxHash(outcome.hash);

      if (outcome.success) {
        setAssessTxPhase('accepted');
        loadData();
      } else if (outcome.pending) {
        setAssessTxPhase('pending_long');
      } else {
        setAssessTxPhase('error');
        setAssessTxError(outcome.error ?? 'Transaction failed');
      }
    } catch (err) {
      setAssessTxPhase('error');
      setAssessTxError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  // ── WALLET GUARDS ──
  if (!address) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="instrument-band p-6">
          <p className="text-sm text-muted mb-4">Connect your wallet to create an epoch.</p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest font-medium clip-corner hover:bg-stable transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="instrument-band p-6 border-strained/30">
          <p className="text-sm text-strained mb-4">Wrong network. Switch to GenLayer StudioNet.</p>
          <button
            onClick={switchNetwork}
            className="bg-strained text-background px-5 py-2.5 text-xs uppercase tracking-widest font-medium clip-corner hover:opacity-90 transition-opacity"
          >
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="instrument-band p-6 animate-pulse">
          <div className="h-4 bg-surface-raised rounded w-1/3 mb-3" />
          <div className="h-3 bg-surface-raised rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="instrument-band p-6 border-critical/30">
          <p className="text-sm text-critical">{error ?? 'Community not found'}</p>
          <button onClick={loadData} className="mt-3 text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* ── HEADER ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href={`/manage/${communityId}`}
            className="text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors font-data"
          >
            {community.name}
          </Link>
          <span className="text-muted">/</span>
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-data">New Epoch</span>
        </div>
        <h1 className="font-display text-3xl text-foreground">Open Assessment Epoch</h1>
        <div className="mt-3 h-px bg-border" />
      </div>

      {/* ── FORM ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Label */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
            Epoch Label
          </label>
          <input
            {...register('label')}
            placeholder="Q3 2026 Assessment"
            className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-stable/50 transition-colors"
          />
          {formErrors.label && (
            <p className="mt-1.5 text-xs text-critical">{formErrors.label.message}</p>
          )}
        </div>

        {/* Window dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Window Start
            </label>
            <input
              {...register('windowStart')}
              type="date"
              className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data focus:outline-none focus:border-stable/50 transition-colors [color-scheme:dark]"
            />
            {formErrors.windowStart && (
              <p className="mt-1.5 text-xs text-critical">{formErrors.windowStart.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Window End
            </label>
            <input
              {...register('windowEnd')}
              type="date"
              className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data focus:outline-none focus:border-stable/50 transition-colors [color-scheme:dark]"
            />
            {formErrors.windowEnd && (
              <p className="mt-1.5 text-xs text-critical">{formErrors.windowEnd.message}</p>
            )}
          </div>
        </div>

        {/* Source Set ID */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
            Source Set ID
          </label>
          <input
            {...register('sourceSetId')}
            placeholder={community.active_source_set_id > 0 ? String(community.active_source_set_id) : '1'}
            defaultValue={community.active_source_set_id > 0 ? String(community.active_source_set_id) : ''}
            className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data placeholder:text-muted/50 focus:outline-none focus:border-stable/50 transition-colors"
          />
          {formErrors.sourceSetId && (
            <p className="mt-1.5 text-xs text-critical">{formErrors.sourceSetId.message}</p>
          )}
          {community.active_source_set_id > 0 && (
            <p className="mt-1 text-xs font-data text-muted">
              Active source set: #{community.active_source_set_id}
            </p>
          )}
        </div>

        {/* Previous Epoch */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
            Previous Epoch
          </label>
          <select
            {...register('previousEpochId')}
            className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data focus:outline-none focus:border-stable/50 transition-colors appearance-none"
          >
            <option value="0">None (first epoch)</option>
            {epochs.map((ep) => (
              <option key={ep.id} value={String(ep.id)}>
                #{ep.id} - {ep.label} ({formatEpochWindow(ep.window_start, ep.window_end)})
              </option>
            ))}
          </select>
          {formErrors.previousEpochId && (
            <p className="mt-1.5 text-xs text-critical">{formErrors.previousEpochId.message}</p>
          )}
        </div>

        {/* Policy Version */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
            Assessment Policy Version
          </label>
          <input
            {...register('policyVersion')}
            placeholder="1"
            className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data placeholder:text-muted/50 focus:outline-none focus:border-stable/50 transition-colors"
          />
          {formErrors.policyVersion && (
            <p className="mt-1.5 text-xs text-critical">{formErrors.policyVersion.message}</p>
          )}
          <p className="mt-1 text-xs font-data text-muted">
            Current policy version: v{community.policy_version}
          </p>
        </div>

        <div className="h-px bg-border" />

        <button
          type="submit"
          disabled={isSubmitting || (createTxPhase !== null && createTxPhase !== 'accepted' && createTxPhase !== 'error')}
          className="bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest font-medium clip-corner hover:bg-stable transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Open Epoch'}
        </button>

        {createTxPhase && (
          <div className="mt-4">
            <TransactionStatus phase={createTxPhase} hash={createTxHash} error={createTxError} />
          </div>
        )}

        {/* Post-creation: Request Assessment */}
        {createTxPhase === 'accepted' && createdEpochId && (
          <div className="mt-6 instrument-band p-5 border-stable/30">
            <p className="text-sm text-stable mb-3">
              Epoch created successfully.
            </p>
            <p className="text-xs text-muted mb-4">
              You can now request an on-chain assessment. Validators will evaluate the evidence sources
              and produce a trust climate verdict.
            </p>
            <button
              onClick={() => {
                // Use the latest epoch from the reloaded list
                const latestEpoch = epochs[0];
                if (latestEpoch) {
                  onRequestAssessment(String(latestEpoch.id));
                }
              }}
              disabled={assessTxPhase !== null && assessTxPhase !== 'accepted' && assessTxPhase !== 'error'}
              className="bg-stable text-background px-5 py-2.5 text-xs uppercase tracking-widest font-medium clip-corner hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Request Assessment
            </button>
            {assessTxPhase && (
              <div className="mt-3">
                <TransactionStatus phase={assessTxPhase} hash={assessTxHash} error={assessTxError} />
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
