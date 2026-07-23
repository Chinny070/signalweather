'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getCommunity, getPolicy } from '@/lib/contract';
import type { Community, PosturePolicy, Climate, Posture } from '@/lib/genlayer/types';
import { CLIMATE_CONFIG, POSTURE_CONFIG } from '@/lib/formatting/climate';

export default function CommunityPolicyPage({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = use(params);
  const [community, setCommunity] = useState<Community | null>(null);
  const [policy, setPolicy] = useState<PosturePolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await getCommunity(communityId);
        setCommunity(c);
        const p = await getPolicy(communityId, String(c.policy_version));
        setPolicy(p);
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
        <span>Policy</span>
      </div>

      <h1 className="font-display text-3xl mb-2">Posture Policy</h1>
      <p className="text-xs font-data text-muted mb-6">Version {community.policy_version}</p>

      <p className="text-sm text-muted mb-6">
        This deterministic mapping converts each climate state into an operational posture.
        The contract enforces this mapping after consensus — the LLM does not choose the posture.
      </p>

      {policy && (
        <div className="space-y-1">
          {(Object.keys(CLIMATE_CONFIG) as Climate[]).map((climate) => {
            const posture = policy[climate] as Posture;
            const climateConf = CLIMATE_CONFIG[climate];
            const postureConf = POSTURE_CONFIG[posture];
            return (
              <div key={climate} className="instrument-band p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: climateConf.color }} />
                  <span className="text-sm uppercase tracking-wider" style={{ color: climateConf.color }}>
                    {climateConf.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">→</span>
                  <span className="text-sm uppercase tracking-wider">{postureConf.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
