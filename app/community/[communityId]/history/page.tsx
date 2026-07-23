'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getCommunity, getCommunityEpochIds, getEpoch, getEpochVerdict } from '@/lib/contract';
import type { Community, Epoch, Verdict, Climate } from '@/lib/genlayer/types';
import { ClimateBadge } from '@/components/climate/ClimateBadge';
import { formatEpochWindow, DIRECTION_LABELS } from '@/lib/formatting/climate';
import type { Direction } from '@/lib/genlayer/types';

export default function CommunityHistoryPage({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = use(params);
  const [community, setCommunity] = useState<Community | null>(null);
  const [epochData, setEpochData] = useState<{ epoch: Epoch; verdict: Verdict | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await getCommunity(communityId);
        setCommunity(c);
        const ids = await getCommunityEpochIds(communityId);
        const data = await Promise.all(
          ids.map(async (id) => {
            const epoch = await getEpoch(String(id));
            const verdict = await getEpochVerdict(String(id));
            return { epoch, verdict };
          })
        );
        setEpochData(data.reverse());
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [communityId]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12 text-muted">Loading...</div>;
  if (!community) return <div className="max-w-7xl mx-auto px-4 py-12 text-muted">Community not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-muted mb-6">
        <Link href={`/community/${communityId}`} className="hover:text-foreground">{community.name}</Link>
        <span>/</span>
        <span>History</span>
      </div>

      <h1 className="font-display text-3xl mb-6">Epoch History</h1>

      {epochData.length === 0 ? (
        <div className="instrument-band p-8 text-center text-muted">No epochs yet.</div>
      ) : (
        <div className="space-y-2">
          {epochData.map(({ epoch, verdict }) => (
            <Link
              key={epoch.id}
              href={`/community/${communityId}/epoch/${epoch.id}`}
              className="instrument-band p-4 flex items-center justify-between gap-4 hover:bg-surface-raised/50 transition-colors group block"
            >
              <div className="flex items-center gap-4">
                <span className="font-data text-xs text-muted">#{epoch.id}</span>
                <div>
                  <p className="text-sm font-medium group-hover:text-stable transition-colors">{epoch.label}</p>
                  <p className="text-xs text-muted font-data">{formatEpochWindow(epoch.window_start, epoch.window_end)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {verdict ? (
                  <>
                    <ClimateBadge climate={verdict.climate as Climate} size="sm" />
                    <span className="text-xs text-muted">{DIRECTION_LABELS[verdict.direction as Direction] || verdict.direction}</span>
                    <span className="text-xs font-data text-muted">{verdict.confidence}%</span>
                  </>
                ) : (
                  <span className="text-xs text-muted uppercase">{epoch.status}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
