'use client';

import type { Climate } from '@/lib/genlayer/types';
import { CLIMATE_CONFIG } from '@/lib/formatting/climate';

interface EpochSummary {
  id: number;
  label: string;
  climate: Climate;
  direction: string;
}

export function PressureRibbon({ epochs }: { epochs: EpochSummary[] }) {
  if (epochs.length === 0) {
    return (
      <div className="instrument-band p-4">
        <h3 className="text-xs uppercase tracking-widest text-muted mb-3">Pressure Ribbon</h3>
        <p className="text-sm text-muted">No epochs yet.</p>
      </div>
    );
  }

  return (
    <div className="instrument-band p-4">
      <h3 className="text-xs uppercase tracking-widest text-muted mb-3">Pressure Ribbon</h3>
      <div className="flex gap-0.5 overflow-x-auto">
        {epochs.map((epoch) => {
          const config = CLIMATE_CONFIG[epoch.climate] || CLIMATE_CONFIG.inconclusive;
          return (
            <div
              key={epoch.id}
              className="flex-shrink-0 w-16 h-10 relative group cursor-pointer transition-opacity hover:opacity-80"
              style={{ backgroundColor: `${config.color}20`, borderBottom: `2px solid ${config.color}` }}
              title={`${epoch.label}: ${config.label}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-data" style={{ color: config.color }}>
                  {epoch.label.slice(-4)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
