'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getCommunity, getCommunitySourceIds, getSource } from '@/lib/contract';
import type { Community, Source } from '@/lib/genlayer/types';
import { SOURCE_TYPE_LABELS } from '@/lib/formatting/climate';

export default function CommunitySourcesPage({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = use(params);
  const [community, setCommunity] = useState<Community | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await getCommunity(communityId);
        setCommunity(c);
        const ids = await getCommunitySourceIds(communityId);
        const srcs = await Promise.all(ids.map((id) => getSource(String(id))));
        setSources(srcs);
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

  const active = sources.filter((s) => s.status === 'active');
  const disabled = sources.filter((s) => s.status !== 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-muted mb-6">
        <Link href={`/community/${communityId}`} className="hover:text-foreground">{community.name}</Link>
        <span>/</span>
        <span>Sources</span>
      </div>

      <h1 className="font-display text-3xl mb-6">Evidence Sources</h1>
      <p className="text-xs text-muted mb-1 uppercase tracking-widest">{active.length} active · {disabled.length} disabled</p>

      <div className="mt-4 space-y-2">
        {sources.map((s) => (
          <div key={s.id} className={`instrument-band p-4 flex items-center justify-between gap-4 ${s.status !== 'active' ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.status === 'active' ? 'bg-evidence' : 'bg-critical'}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{s.label}</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs font-data text-consensus hover:underline truncate block">
                  {s.url}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs text-muted">
              <span>{SOURCE_TYPE_LABELS[s.source_type] || s.source_type}</span>
              <span className="font-data">#{s.id}</span>
            </div>
          </div>
        ))}
        {sources.length === 0 && (
          <div className="instrument-band p-8 text-center text-muted">No sources registered.</div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted italic">
        Frontend preview only. Validators will independently fetch these sources during assessment.
      </p>
    </div>
  );
}
