'use client';

import type { Source } from '@/lib/genlayer/types';
import { SOURCE_TYPE_LABELS } from '@/lib/formatting/climate';

const TYPE_GROUPS: Record<string, string[]> = {
  Governance: ['governance_forum', 'proposal', 'vote_results'],
  Development: ['github_issue', 'github_discussion', 'github_pull_request'],
  Operations: ['incident_report', 'postmortem', 'status_page'],
  Communication: ['transparency_report', 'public_transcript', 'official_statement', 'other_public'],
};

export function SourceRadar({ sources }: { sources: Source[] }) {
  const groups = Object.entries(TYPE_GROUPS).map(([group, types]) => ({
    group,
    sources: sources.filter((s) => types.includes(s.source_type)),
  }));

  return (
    <div className="instrument-band p-4">
      <h3 className="text-xs uppercase tracking-widest text-muted mb-4">Source Radar</h3>
      <div className="grid grid-cols-2 gap-3">
        {groups.map(({ group, sources: groupSources }) => (
          <div key={group} className="bg-surface-raised p-3">
            <p className="text-xs uppercase tracking-wider text-muted mb-2">{group}</p>
            {groupSources.length === 0 ? (
              <p className="text-xs text-muted/50">No sources</p>
            ) : (
              <div className="space-y-1">
                {groupSources.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-evidence' : 'bg-critical'}`}
                    />
                    <span className="text-xs truncate">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
