'use client';

import type { Climate } from '@/lib/genlayer/types';
import { CLIMATE_CONFIG } from '@/lib/formatting/climate';

export function ClimateBadge({ climate, size = 'md' }: { climate: Climate; size?: 'sm' | 'md' | 'lg' }) {
  const config = CLIMATE_CONFIG[climate];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium uppercase tracking-wider clip-corner ${sizeClasses[size]}`}
      style={{ backgroundColor: `${config.color}15`, color: config.color, border: `1px solid ${config.color}30` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
