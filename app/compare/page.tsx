'use client';

import { useEffect, useState } from 'react';
import { getAllCommunities } from '@/lib/contract';
import type { Community, Climate } from '@/lib/genlayer/types';
import { CLIMATE_CONFIG } from '@/lib/formatting/climate';

export default function ComparePage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCommunities()
      .then(setCommunities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl md:text-5xl mb-2">Compare</h1>
      <p className="text-muted mb-8">Side-by-side community trust climates.</p>

      {loading ? (
        <div className="instrument-band p-8 text-center text-muted">Loading...</div>
      ) : communities.length < 2 ? (
        <div className="instrument-band p-8 text-center text-muted">
          At least 2 communities are needed for comparison.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 text-xs uppercase tracking-wider text-muted">Community</th>
                <th className="text-left py-3 pr-4 text-xs uppercase tracking-wider text-muted">Climate</th>
                <th className="text-left py-3 pr-4 text-xs uppercase tracking-wider text-muted">Posture</th>
                <th className="text-left py-3 text-xs uppercase tracking-wider text-muted">Latest Epoch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {communities.map((c) => {
                const config = CLIMATE_CONFIG[c.current_climate as Climate] || CLIMATE_CONFIG.inconclusive;
                return (
                  <tr key={c.id}>
                    <td className="py-3 pr-4">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs font-data text-muted ml-2">{c.slug}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="uppercase text-xs tracking-wider" style={{ color: config.color }}>
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs uppercase text-muted">{c.current_posture}</td>
                    <td className="py-3 text-xs font-data text-muted">#{c.latest_epoch_id || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
