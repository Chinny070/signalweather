'use client';

import type { Posture } from '@/lib/genlayer/types';
import { POSTURE_CONFIG } from '@/lib/formatting/climate';
import { PostureBadge } from './PostureBadge';

const POSTURE_RESTRICTIONS: Record<Posture, string[]> = {
  normal: [],
  observe: ['Active risks highlighted', 'Additional monitoring recommended'],
  heightened_review: ['High-value proposals flagged', 'Longer discussion windows recommended', 'Explicit trust risk acknowledgement required'],
  cooldown: ['Treasury actions marked high-risk', 'Temporary delay advised', 'Override reason required'],
  emergency: ['Community marked socially unstable', 'Manual council review required', 'Prominent warning on all high-risk operations'],
};

interface OperationalGateProps {
  posture: Posture;
  policyVersion: number;
  overridePermitted?: boolean;
}

export function OperationalGate({ posture, policyVersion, overridePermitted }: OperationalGateProps) {
  const restrictions = POSTURE_RESTRICTIONS[posture];

  return (
    <div className="instrument-band p-4">
      <h3 className="text-xs uppercase tracking-widest text-muted mb-4">Operational Gate</h3>
      <div className="flex items-center gap-3 mb-4">
        <PostureBadge posture={posture} />
        <span className="text-xs font-data text-muted">Policy v{policyVersion}</span>
      </div>

      {restrictions.length > 0 ? (
        <ul className="space-y-1.5">
          {restrictions.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-strained mt-0.5">▸</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No restrictions active.</p>
      )}

      {overridePermitted !== undefined && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted">
            Override: {overridePermitted ? 'Permitted with reason' : 'Not available'}
          </span>
        </div>
      )}
    </div>
  );
}
