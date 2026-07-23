'use client';

import type { SupportingFinding, Source } from '@/lib/genlayer/types';
import { DIMENSION_LABELS, SOURCE_TYPE_LABELS } from '@/lib/formatting/climate';

interface EvidenceLedgerProps {
  findings: SupportingFinding[];
  sources: Source[];
}

const SUPPORT_COLORS = {
  positive: '#6FE3A1',
  negative: '#FF3B4E',
  mixed: '#E6A84A',
};

export function EvidenceLedger({ findings, sources }: EvidenceLedgerProps) {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));

  if (findings.length === 0) {
    return (
      <div className="instrument-band p-4">
        <h3 className="text-xs uppercase tracking-widest text-muted mb-3">Evidence Ledger</h3>
        <p className="text-sm text-muted">No findings recorded.</p>
      </div>
    );
  }

  return (
    <div className="instrument-band p-4">
      <h3 className="text-xs uppercase tracking-widest text-muted mb-3">Evidence Ledger</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted border-b border-border">
              <th className="text-left py-2 pr-3">Source</th>
              <th className="text-left py-2 pr-3">Type</th>
              <th className="text-left py-2 pr-3">Dimension</th>
              <th className="text-left py-2 pr-3">Finding</th>
              <th className="text-left py-2">Support</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f, i) => {
              const source = sourceMap.get(f.source_id);
              const supportColor = SUPPORT_COLORS[f.support] || '#82909D';
              return (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-3">
                    {source ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-consensus hover:underline font-data"
                      >
                        #{f.source_id}
                      </a>
                    ) : (
                      <span className="font-data text-muted">#{f.source_id}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-muted">
                    {source ? SOURCE_TYPE_LABELS[source.source_type] || source.source_type : '—'}
                  </td>
                  <td className="py-2 pr-3">
                    {DIMENSION_LABELS[f.dimension as keyof typeof DIMENSION_LABELS] || f.dimension}
                  </td>
                  <td className="py-2 pr-3 font-data">{f.finding_code.replace(/_/g, ' ')}</td>
                  <td className="py-2">
                    <span style={{ color: supportColor }} className="uppercase font-medium">
                      {f.support}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
