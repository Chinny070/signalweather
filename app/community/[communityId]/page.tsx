'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCommunity, getCommunityEpochIds, getCommunitySourceIds,
  getEpoch, getEpochVerdict, getSource,
} from '@/lib/contract';
import type { Community, Epoch, Verdict, Source, Climate, Posture, Direction, DimensionKey } from '@/lib/genlayer/types';
import { ClimateField } from '@/components/climate/ClimateField';
import { TrustCrossSection } from '@/components/climate/TrustCrossSection';
import { PressureRibbon } from '@/components/climate/PressureRibbon';
import { SourceRadar } from '@/components/climate/SourceRadar';
import { OperationalGate } from '@/components/climate/OperationalGate';
import { EvidenceLedger } from '@/components/climate/EvidenceLedger';
import { formatAddress } from '@/lib/formatting/climate';

export default function CommunityPage({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = use(params);
  const [community, setCommunity] = useState<Community | null>(null);
  const [latestVerdict, setLatestVerdict] = useState<Verdict | null>(null);
  const [epochs, setEpochs] = useState<Epoch[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await getCommunity(communityId);
        setCommunity(c);

        const [epochIds, sourceIds] = await Promise.all([
          getCommunityEpochIds(communityId),
          getCommunitySourceIds(communityId),
        ]);

        const epochsData = await Promise.all(
          epochIds.slice(-10).map((id) => getEpoch(String(id)))
        );
        setEpochs(epochsData);

        if (c.latest_epoch_id > 0) {
          const verdict = await getEpochVerdict(String(c.latest_epoch_id));
          setLatestVerdict(verdict);
        }

        const sourcesData = await Promise.all(
          sourceIds.map((id) => getSource(String(id)))
        );
        setSources(sourcesData);
      } catch {
        // contract error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [communityId]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-muted">Loading community...</div>;
  }

  if (!community) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-muted">Community not found.</div>;
  }

  const epochSummaries = epochs
    .filter((e) => e.status === 'accepted')
    .map((e) => ({
      id: e.id,
      label: e.label,
      climate: (community.current_climate || 'inconclusive') as Climate,
      direction: 'unknown',
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Command strip */}
      <div className="instrument-band p-4 mb-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="font-medium text-lg">{community.name}</h1>
            <p className="text-xs font-data text-muted">{community.slug}</p>
          </div>
          <div className="text-xs text-muted">
            <span className="mr-4">Epoch #{community.latest_epoch_id || '—'}</span>
            <span>Owner: {formatAddress(community.owner)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/community/${communityId}/sources`} className="text-xs text-consensus hover:underline">Sources</Link>
          <Link href={`/community/${communityId}/history`} className="text-xs text-consensus hover:underline">History</Link>
          <Link href={`/community/${communityId}/policy`} className="text-xs text-consensus hover:underline">Policy</Link>
          <Link href={`/manage/${communityId}`} className="text-xs text-challenge hover:underline">Manage</Link>
        </div>
      </div>

      {/* Climate Field */}
      <ClimateField
        climate={(community.current_climate || 'inconclusive') as Climate}
        posture={(community.current_posture || 'observe') as Posture}
        direction={(latestVerdict?.direction || 'unknown') as Direction}
        epochLabel={epochs.length > 0 ? epochs[epochs.length - 1].label : undefined}
        communityName={community.name}
      />

      {/* Pressure Ribbon */}
      <div className="mt-3">
        <PressureRibbon epochs={epochSummaries} />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-3 mt-3">
        {/* Left: Trust dimensions + Evidence */}
        <div className="lg:col-span-2 space-y-3">
          {latestVerdict && (
            <>
              <TrustCrossSection dimensions={latestVerdict.dimensions as Record<DimensionKey, string>} />
              <EvidenceLedger findings={latestVerdict.supporting_findings} sources={sources} />
            </>
          )}
          {!latestVerdict && (
            <div className="instrument-band p-8 text-center text-muted">
              No assessment completed yet.
              {community.owner && (
                <Link href={`/manage/${communityId}/epochs/new`} className="block mt-2 text-consensus hover:underline text-sm">
                  Create the first epoch →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-3">
          <SourceRadar sources={sources} />
          <OperationalGate
            posture={(community.current_posture || 'observe') as Posture}
            policyVersion={community.policy_version}
            overridePermitted={['heightened_review', 'cooldown', 'emergency'].includes(community.current_posture)}
          />
          {latestVerdict && (
            <div className="instrument-band p-4">
              <h3 className="text-xs uppercase tracking-widest text-muted mb-2">Verdict Summary</h3>
              <p className="text-sm leading-relaxed">{latestVerdict.short_reason}</p>
              <div className="mt-3 flex gap-4 text-xs text-muted">
                <span>Confidence: {latestVerdict.confidence}%</span>
                <span>Coverage: {latestVerdict.evidence_coverage_band}</span>
              </div>
              {latestVerdict.material_risk_flags.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted mb-1">Risk flags:</p>
                  <div className="flex flex-wrap gap-1">
                    {latestVerdict.material_risk_flags.map((flag) => (
                      <span key={flag} className="px-2 py-0.5 text-[10px] font-data bg-strained/10 text-strained border border-strained/20">
                        {flag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
