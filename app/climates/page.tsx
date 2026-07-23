'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllCommunities } from '@/lib/contract';
import type { Community, Climate, Posture } from '@/lib/genlayer/types';
import { ClimateBadge } from '@/components/climate/ClimateBadge';
import { PostureBadge } from '@/components/climate/PostureBadge';
import { CLIMATE_CONFIG } from '@/lib/formatting/climate';

export default function ClimatesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Climate | 'all'>('all');

  useEffect(() => {
    getAllCommunities()
      .then(setCommunities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? communities
    : communities.filter((c) => c.current_climate === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl md:text-5xl mb-2">Climate Board</h1>
      <p className="text-muted mb-8">All registered community trust climates.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs uppercase tracking-wider border clip-corner transition-colors ${filter === 'all' ? 'bg-surface-raised border-foreground/30 text-foreground' : 'border-border text-muted hover:text-foreground'}`}
        >
          All
        </button>
        {(Object.keys(CLIMATE_CONFIG) as Climate[]).map((climate) => (
          <button
            key={climate}
            onClick={() => setFilter(climate)}
            className="px-3 py-1 text-xs uppercase tracking-wider border clip-corner transition-colors"
            style={{
              borderColor: filter === climate ? CLIMATE_CONFIG[climate].color + '60' : 'var(--border)',
              color: filter === climate ? CLIMATE_CONFIG[climate].color : 'var(--text-muted)',
              backgroundColor: filter === climate ? CLIMATE_CONFIG[climate].color + '10' : 'transparent',
            }}
          >
            {CLIMATE_CONFIG[climate].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="instrument-band p-8 text-center text-muted">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="instrument-band p-8 text-center text-muted">
          {filter === 'all' ? 'No communities registered.' : `No communities with ${filter} climate.`}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/community/${c.id}`}
              className="instrument-band p-5 flex items-center justify-between gap-4 hover:bg-surface-raised/50 transition-colors group"
            >
              <div>
                <h3 className="font-medium group-hover:text-stable transition-colors">{c.name}</h3>
                <p className="text-xs text-muted font-data mt-0.5">{c.slug}</p>
                {c.description && <p className="text-xs text-muted mt-1 max-w-md truncate">{c.description}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ClimateBadge climate={c.current_climate as Climate} size="sm" />
                <PostureBadge posture={c.current_posture as Posture} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
