'use client';

import type { DimensionKey } from '@/lib/genlayer/types';
import { DIMENSION_LABELS, CLIMATE_CONFIG } from '@/lib/formatting/climate';
import type { Climate } from '@/lib/genlayer/types';

const DIMENSION_STATE_COLORS: Record<string, string> = {
  improving: '#42D6C6', healthy: '#42D6C6', strong: '#42D6C6', strengthening: '#42D6C6', coherent: '#42D6C6', low: '#42D6C6',
  stable: '#5D8CFF', adequate: '#5D8CFF', acceptable: '#5D8CFF', mostly_coherent: '#5D8CFF', manageable: '#5D8CFF',
  weakening: '#E6A84A', weak: '#E6A84A', contested: '#E6A84A', declining: '#E6A84A', fragmented: '#E6A84A', elevated: '#E6A84A',
  severely_weak: '#FF3B4E', broken: '#FF3B4E', compromised: '#FF3B4E', disrupted: '#FF3B4E', contradictory: '#FF3B4E', severe: '#FF3B4E',
  unknown: '#82909D',
};

interface TrustCrossSectionProps {
  dimensions: Record<DimensionKey, string>;
}

const DIMENSION_ORDER: DimensionKey[] = [
  'participation_health', 'conflict_temperature', 'resolution_reliability',
  'governance_legitimacy', 'contributor_continuity', 'narrative_coherence',
];

export function TrustCrossSection({ dimensions }: TrustCrossSectionProps) {
  return (
    <div className="instrument-band p-4">
      <h3 className="text-xs uppercase tracking-widest text-muted mb-4">Trust Cross-Section</h3>
      <div className="space-y-1">
        {DIMENSION_ORDER.map((key) => {
          const state = dimensions[key] || 'unknown';
          const color = DIMENSION_STATE_COLORS[state] || '#82909D';
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-muted w-40 shrink-0 truncate">{DIMENSION_LABELS[key]}</span>
              <div className="flex-1 h-6 bg-surface-raised relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700"
                  style={{
                    backgroundColor: `${color}25`,
                    borderRight: `2px solid ${color}`,
                    width: stateToWidth(state),
                  }}
                />
              </div>
              <span
                className="text-xs font-data w-28 text-right uppercase"
                style={{ color }}
              >
                {state.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function stateToWidth(state: string): string {
  const map: Record<string, string> = {
    improving: '90%', healthy: '85%', strong: '85%', strengthening: '90%', coherent: '85%', low: '85%',
    stable: '70%', adequate: '70%', acceptable: '70%', mostly_coherent: '70%', manageable: '70%',
    weakening: '45%', weak: '45%', contested: '45%', declining: '45%', fragmented: '45%', elevated: '45%',
    severely_weak: '20%', broken: '20%', compromised: '20%', disrupted: '20%', contradictory: '20%', severe: '20%',
    unknown: '10%',
  };
  return map[state] || '10%';
}
