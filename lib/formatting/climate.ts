import type { Climate, Direction, Posture, CoverageBand, DimensionKey } from '@/lib/genlayer/types';

export const CLIMATE_CONFIG: Record<Climate, { label: string; color: string; description: string }> = {
  stable: { label: 'Stable', color: '#42D6C6', description: 'Healthy participation, manageable disagreement, functioning resolution.' },
  strengthening: { label: 'Strengthening', color: '#5D8CFF', description: 'Trust improving across multiple dimensions vs previous epoch.' },
  strained: { label: 'Strained', color: '#E6A84A', description: 'Material warning signs; core processes still function.' },
  eroding: { label: 'Eroding', color: '#F06A4F', description: 'Multiple dimensions weakening; confidence visibly declining.' },
  fragile: { label: 'Fragile', color: '#D35CFF', description: 'One more conflict could trigger wider breakdown.' },
  critical: { label: 'Critical', color: '#FF3B4E', description: 'Broad loss of confidence, governance failure, or operational paralysis.' },
  inconclusive: { label: 'Inconclusive', color: '#82909D', description: 'Evidence insufficient for a defensible verdict.' },
};

export const POSTURE_CONFIG: Record<Posture, { label: string; severity: number; description: string }> = {
  normal: { label: 'Normal', severity: 0, description: 'Ordinary governance cadence.' },
  observe: { label: 'Observe', severity: 1, description: 'Active risks highlighted; additional monitoring recommended.' },
  heightened_review: { label: 'Heightened Review', severity: 2, description: 'High-value proposals flagged; longer discussion windows.' },
  cooldown: { label: 'Cooldown', severity: 3, description: 'Treasury and irreversible actions marked high-risk.' },
  emergency: { label: 'Emergency', severity: 4, description: 'Community socially unstable; manual council review required.' },
};

export const DIRECTION_LABELS: Record<Direction, string> = {
  improving: 'Improving',
  unchanged: 'Unchanged',
  worsening: 'Worsening',
  volatile: 'Volatile',
  unknown: 'Unknown',
};

export const COVERAGE_LABELS: Record<CoverageBand, string> = {
  strong: 'Strong',
  adequate: 'Adequate',
  thin: 'Thin',
  failed: 'Failed',
};

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  participation_health: 'Participation Health',
  conflict_temperature: 'Conflict Temperature',
  resolution_reliability: 'Resolution Reliability',
  governance_legitimacy: 'Governance Legitimacy',
  contributor_continuity: 'Contributor Continuity',
  narrative_coherence: 'Narrative Coherence',
};

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  governance_forum: 'Governance Forum',
  proposal: 'Proposal',
  vote_results: 'Vote Results',
  github_issue: 'GitHub Issue',
  github_discussion: 'GitHub Discussion',
  github_pull_request: 'GitHub Pull Request',
  incident_report: 'Incident Report',
  postmortem: 'Postmortem',
  status_page: 'Status Page',
  transparency_report: 'Transparency Report',
  public_transcript: 'Public Transcript',
  official_statement: 'Official Statement',
  other_public: 'Other Public Source',
};

export function climateColor(climate: Climate): string {
  return CLIMATE_CONFIG[climate]?.color ?? '#82909D';
}

export function postureLabel(posture: Posture): string {
  return POSTURE_CONFIG[posture]?.label ?? posture;
}

export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEpochWindow(start: number, end: number): string {
  if (start === 0 && end === 0) return 'Not set';
  const s = new Date(start * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const e = new Date(end * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${s} → ${e}`;
}
