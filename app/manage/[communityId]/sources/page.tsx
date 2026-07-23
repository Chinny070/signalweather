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
  getCommunity, getCommunitySourceIds, getSource, getSourceSet,
  addSource, disableSource, createSourceSet,
} from '@/lib/contract';
import { SOURCE_TYPE_LABELS } from '@/lib/formatting/climate';
import type { Community, Source, SourceSet, SourceType } from '@/lib/genlayer/types';

const VALID_SOURCE_TYPES: SourceType[] = [
  'governance_forum', 'proposal', 'vote_results', 'github_issue',
  'github_discussion', 'github_pull_request', 'incident_report',
  'postmortem', 'status_page', 'transparency_report',
  'public_transcript', 'official_statement', 'other_public',
];

const addSourceSchema = z.object({
  sourceType: z.enum(VALID_SOURCE_TYPES as [string, ...string[]]),
  url: z.string().url('Must be a valid URL'),
  label: z.string().min(1, 'Label is required').max(200, 'Label must be 200 characters or fewer'),
});

type AddSourceData = z.infer<typeof addSourceSchema>;

export default function SourcesPage() {
  const params = useParams<{ communityId: string }>();
  const communityId = params.communityId;
  const { address, isCorrectNetwork, connect, switchNetwork, isConnecting } = useWallet();

  const [community, setCommunity] = useState<Community | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeSourceSet, setActiveSourceSet] = useState<SourceSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add source tx state
  const [addTxPhase, setAddTxPhase] = useState<TxPhase | null>(null);
  const [addTxHash, setAddTxHash] = useState<string | undefined>();
  const [addTxError, setAddTxError] = useState<string | undefined>();

  // Disable source tx state
  const [disableTxPhase, setDisableTxPhase] = useState<TxPhase | null>(null);
  const [disableTxHash, setDisableTxHash] = useState<string | undefined>();
  const [disableTxError, setDisableTxError] = useState<string | undefined>();
  const [disablingSourceId, setDisablingSourceId] = useState<number | null>(null);

  // Create source set tx state
  const [setTxPhase, setSetTxPhase] = useState<TxPhase | null>(null);
  const [setTxHash, setSetTxHash] = useState<string | undefined>();
  const [setTxError, setSetTxError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<AddSourceData>({ resolver: zodResolver(addSourceSchema) });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const comm = await getCommunity(communityId);
      setCommunity(comm);

      const sourceIds = await getCommunitySourceIds(communityId);
      const sourceList = await Promise.all(
        sourceIds.map((id) => getSource(String(id)))
      );
      setSources(sourceList);

      if (comm.active_source_set_id > 0) {
        const ss = await getSourceSet(String(comm.active_source_set_id)).catch(() => null);
        setActiveSourceSet(ss);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function onAddSource(data: AddSourceData) {
    setAddTxPhase('preparing');
    setAddTxHash(undefined);
    setAddTxError(undefined);

    try {
      setAddTxPhase('wallet_confirm');
      const outcome = await addSource(communityId, data.sourceType, data.url, data.label);
      setAddTxHash(outcome.hash);

      if (outcome.success) {
        setAddTxPhase('accepted');
        reset();
        loadData();
      } else {
        setAddTxPhase('error');
        setAddTxError(outcome.error ?? 'Transaction failed');
      }
    } catch (err) {
      setAddTxPhase('error');
      setAddTxError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function onDisableSource(sourceId: number) {
    setDisablingSourceId(sourceId);
    setDisableTxPhase('preparing');
    setDisableTxHash(undefined);
    setDisableTxError(undefined);

    try {
      setDisableTxPhase('wallet_confirm');
      const outcome = await disableSource(communityId, String(sourceId), 'Disabled by owner');
      setDisableTxHash(outcome.hash);

      if (outcome.success) {
        setDisableTxPhase('accepted');
        loadData();
      } else {
        setDisableTxPhase('error');
        setDisableTxError(outcome.error ?? 'Transaction failed');
      }
    } catch (err) {
      setDisableTxPhase('error');
      setDisableTxError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function onCreateSourceSet() {
    const activeIds = sources.filter((s) => s.status === 'active').map((s) => s.id);
    if (activeIds.length === 0) return;

    setSetTxPhase('preparing');
    setSetTxHash(undefined);
    setSetTxError(undefined);

    try {
      setSetTxPhase('wallet_confirm');
      const outcome = await createSourceSet(communityId, JSON.stringify(activeIds));
      setSetTxHash(outcome.hash);

      if (outcome.success) {
        setSetTxPhase('accepted');
        loadData();
      } else {
        setSetTxPhase('error');
        setSetTxError(outcome.error ?? 'Transaction failed');
      }
    } catch (err) {
      setSetTxPhase('error');
      setSetTxError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  // ── WALLET GUARDS ──
  if (!address) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="instrument-band p-6">
          <p className="text-sm text-muted mb-4">Connect your wallet to manage sources.</p>
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
      <div className="max-w-4xl mx-auto px-4 py-12">
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="instrument-band p-6 animate-pulse">
          <div className="h-4 bg-surface-raised rounded w-1/3 mb-3" />
          <div className="h-3 bg-surface-raised rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="instrument-band p-6 border-critical/30">
          <p className="text-sm text-critical">{error ?? 'Community not found'}</p>
          <button onClick={loadData} className="mt-3 text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeSources = sources.filter((s) => s.status === 'active');
  const disabledSources = sources.filter((s) => s.status !== 'active');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-data">Sources</span>
        </div>
        <h1 className="font-display text-3xl text-foreground">Evidence Sources</h1>
        <div className="mt-3 h-px bg-border" />
      </div>

      {/* ── ACTIVE SOURCE SET ── */}
      {activeSourceSet && (
        <div className="instrument-band p-4 mb-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-2">Active Source Set</p>
          <div className="flex items-center gap-4 text-sm font-data">
            <span>Set #{activeSourceSet.id}</span>
            <span className="text-muted">v{activeSourceSet.version}</span>
            <span className="text-muted">{activeSourceSet.source_count} sources</span>
            {activeSourceSet.frozen && (
              <span className="text-xs uppercase tracking-wider text-strained">Frozen</span>
            )}
          </div>
          <p className="text-xs font-data text-muted mt-1">
            Source IDs: [{activeSourceSet.source_ids.join(', ')}]
          </p>
        </div>
      )}

      {/* ── ACTIVE SOURCES ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.2em] text-muted font-data">
          Active Sources ({activeSources.length})
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {activeSources.length === 0 ? (
        <div className="instrument-band p-6 text-center mb-6">
          <p className="text-sm text-muted">No active sources. Add one below.</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {activeSources.map((source) => (
            <div key={source.id} className="instrument-band p-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{source.label}</span>
                  <span className="text-xs font-data uppercase tracking-wider text-evidence">
                    {SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}
                  </span>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-data text-consensus hover:underline truncate block"
                >
                  {source.url}
                </a>
                <p className="text-xs font-data text-muted mt-0.5">
                  Source #{source.id} / Added {new Date(source.added_at * 1000).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => onDisableSource(source.id)}
                disabled={disablingSourceId === source.id && disableTxPhase !== null && disableTxPhase !== 'accepted' && disableTxPhase !== 'error'}
                className="text-xs uppercase tracking-widest text-critical/70 hover:text-critical transition-colors shrink-0 disabled:opacity-50"
              >
                Disable
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Disable tx status */}
      {disableTxPhase && (
        <div className="mb-6">
          <TransactionStatus phase={disableTxPhase} hash={disableTxHash} error={disableTxError} />
        </div>
      )}

      {/* ── CREATE SOURCE SET ── */}
      {activeSources.length > 0 && (
        <div className="instrument-band p-5 mb-8">
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
            Create New Source Set
          </p>
          <p className="text-sm text-muted mb-3">
            Freeze the current {activeSources.length} active source{activeSources.length !== 1 ? 's' : ''} into a new source set for epoch assessment.
          </p>
          <button
            onClick={onCreateSourceSet}
            disabled={setTxPhase !== null && setTxPhase !== 'accepted' && setTxPhase !== 'error'}
            className="bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest font-medium clip-corner hover:bg-stable transition-colors disabled:opacity-50"
          >
            Create Source Set
          </button>
          {setTxPhase && (
            <div className="mt-3">
              <TransactionStatus phase={setTxPhase} hash={setTxHash} error={setTxError} />
            </div>
          )}
        </div>
      )}

      {/* ── DISABLED SOURCES ── */}
      {disabledSources.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted font-data">
              Disabled / Superseded ({disabledSources.length})
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2 mb-8 opacity-60">
            {disabledSources.map((source) => (
              <div key={source.id} className="instrument-band p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-foreground/60">{source.label}</span>
                  <span className="text-xs font-data uppercase tracking-wider text-muted">
                    {SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}
                  </span>
                  <span className="text-xs font-data uppercase tracking-wider text-critical/60">
                    {source.status}
                  </span>
                </div>
                <p className="text-xs font-data text-muted">{source.url}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── ADD SOURCE FORM ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.2em] text-muted font-data">Add New Source</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onAddSource)} className="instrument-band p-5 space-y-5">
        {/* Source type */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
            Source Type
          </label>
          <select
            {...register('sourceType')}
            className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data focus:outline-none focus:border-stable/50 transition-colors appearance-none"
          >
            <option value="">Select type...</option>
            {VALID_SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SOURCE_TYPE_LABELS[t] ?? t}
              </option>
            ))}
          </select>
          {formErrors.sourceType && (
            <p className="mt-1.5 text-xs text-critical">{formErrors.sourceType.message}</p>
          )}
        </div>

        {/* URL */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
            URL
          </label>
          <input
            {...register('url')}
            placeholder="https://forum.example.com/post/123"
            className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data placeholder:text-muted/50 focus:outline-none focus:border-stable/50 transition-colors"
          />
          {formErrors.url && (
            <p className="mt-1.5 text-xs text-critical">{formErrors.url.message}</p>
          )}
        </div>

        {/* Label */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
            Label
          </label>
          <input
            {...register('label')}
            placeholder="Descriptive label for this source"
            className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-stable/50 transition-colors"
          />
          {formErrors.label && (
            <p className="mt-1.5 text-xs text-critical">{formErrors.label.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (addTxPhase !== null && addTxPhase !== 'accepted' && addTxPhase !== 'error')}
          className="bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest font-medium clip-corner hover:bg-stable transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Add Source'}
        </button>

        {addTxPhase && (
          <div className="mt-3">
            <TransactionStatus phase={addTxPhase} hash={addTxHash} error={addTxError} />
          </div>
        )}
      </form>
    </div>
  );
}
