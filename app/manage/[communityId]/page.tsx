'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/components/wallet/WalletProvider';
import { ClimateBadge } from '@/components/climate/ClimateBadge';
import { PostureBadge } from '@/components/climate/PostureBadge';
import {
  getCommunity, getCommunityEpochIds, getEpoch, getEpochVerdict,
} from '@/lib/contract';
import { formatEpochWindow } from '@/lib/formatting/climate';
import type { Community, Epoch, Verdict } from '@/lib/genlayer/types';

interface EpochRow {
  epoch: Epoch;
  verdict: Verdict | null;
}

export default function ManageCommunityPage() {
  const params = useParams<{ communityId: string }>();
  const communityId = params.communityId;
  const { address, isCorrectNetwork, connect, switchNetwork, isConnecting } = useWallet();

  const [community, setCommunity] = useState<Community | null>(null);
  const [epochs, setEpochs] = useState<EpochRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const comm = await getCommunity(communityId);
      setCommunity(comm);

      const epochIds = await getCommunityEpochIds(communityId);
      const epochRows: EpochRow[] = await Promise.all(
        epochIds.map(async (id) => {
          const epoch = await getEpoch(String(id));
          const verdict = await getEpochVerdict(String(id)).catch(() => null);
          return { epoch, verdict };
        })
      );
      setEpochs(epochRows.reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!address) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="instrument-band p-6">
          <p className="text-sm text-muted mb-4">Connect your wallet to manage this community.</p>
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* ── HEADER ── */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2 font-data">
          Community #{community.id} / {community.slug}
        </p>
        <h1 className="font-display text-3xl text-foreground">{community.name}</h1>
        <p className="mt-2 text-sm text-muted max-w-xl">{community.description}</p>
        <div className="mt-3 h-px bg-border" />
      </div>

      {/* ── STATUS BAND ── */}
      <div className="instrument-band p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1.5">Climate</p>
            <ClimateBadge climate={community.current_climate} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1.5">Posture</p>
            <PostureBadge posture={community.current_posture} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1.5">Status</p>
            <span className="text-sm font-data uppercase tracking-wider">{community.status}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1.5">Governance</p>
            <a
              href={community.governance_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-data text-consensus hover:underline truncate block"
            >
              {community.governance_url}
            </a>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION LINKS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link
          href={`/manage/${communityId}/sources`}
          className="instrument-band p-5 hover:border-stable/40 transition-colors group"
        >
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1">Sources</p>
          <p className="text-sm text-foreground group-hover:text-stable transition-colors">
            Manage evidence sources →
          </p>
        </Link>
        <Link
          href={`/manage/${communityId}/epochs/new`}
          className="instrument-band p-5 hover:border-stable/40 transition-colors group"
        >
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1">New Epoch</p>
          <p className="text-sm text-foreground group-hover:text-stable transition-colors">
            Open assessment epoch →
          </p>
        </Link>
        <Link
          href={`/community/${communityId}`}
          className="instrument-band p-5 hover:border-stable/40 transition-colors group"
        >
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1">Public Profile</p>
          <p className="text-sm text-foreground group-hover:text-stable transition-colors">
            View public climate page →
          </p>
        </Link>
      </div>

      {/* ── CROSSHAIR DIVIDER ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.2em] text-muted font-data">Epoch History</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* ── EPOCH LIST ── */}
      {epochs.length === 0 ? (
        <div className="instrument-band p-6 text-center">
          <p className="text-sm text-muted">No epochs recorded yet.</p>
          <Link
            href={`/manage/${communityId}/epochs/new`}
            className="mt-3 inline-block text-xs uppercase tracking-widest text-stable hover:underline"
          >
            Create First Epoch →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {epochs.map(({ epoch, verdict }) => (
            <div key={epoch.id} className="instrument-band p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={`/community/${communityId}/epoch/${epoch.id}`} className="text-sm font-medium text-foreground hover:text-stable transition-colors hover:underline">{epoch.label}</Link>
                    <span className="text-xs font-data uppercase tracking-wider text-muted">
                      {epoch.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-data text-muted">
                    {formatEpochWindow(epoch.window_start, epoch.window_end)}
                  </p>
                  <p className="text-xs font-data text-muted mt-0.5">
                    Epoch #{epoch.id} / Source Set #{epoch.source_set_id} / Policy v{epoch.assessment_policy_version}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {verdict && <ClimateBadge climate={verdict.climate} size="sm" />}
                  {epoch.status === 'accepted' && (
                    <Link
                      href={`/manage/${communityId}/challenge/${epoch.id}`}
                      className="text-xs uppercase tracking-widest text-challenge hover:underline font-data"
                    >
                      Challenge
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
