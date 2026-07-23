'use client';

import type { Posture } from '@/lib/genlayer/types';
import { POSTURE_CONFIG } from '@/lib/formatting/climate';

const SEVERITY_COLORS = ['#42D6C6', '#5D8CFF', '#E6A84A', '#F06A4F', '#FF3B4E'];

export function PostureBadge({ posture }: { posture: Posture }) {
  const config = POSTURE_CONFIG[posture];
  const color = SEVERITY_COLORS[config.severity];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium uppercase tracking-widest"
      style={{ backgroundColor: `${color}10`, color, border: `1px solid ${color}25` }}
    >
      {config.label}
    </span>
  );
}
