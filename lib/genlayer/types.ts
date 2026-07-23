export type Climate = 'stable' | 'strengthening' | 'strained' | 'eroding' | 'fragile' | 'critical' | 'inconclusive';
export type Direction = 'improving' | 'unchanged' | 'worsening' | 'volatile' | 'unknown';
export type Posture = 'normal' | 'observe' | 'heightened_review' | 'cooldown' | 'emergency';
export type CoverageBand = 'strong' | 'adequate' | 'thin' | 'failed';
export type EpochStatus = 'draft' | 'collecting' | 'assessment_pending' | 'accepted' | 'undetermined' | 'challenged' | 'reassessment_pending' | 'superseded';
export type SourceType = 'governance_forum' | 'proposal' | 'vote_results' | 'github_issue' | 'github_discussion' | 'github_pull_request' | 'incident_report' | 'postmortem' | 'status_page' | 'transparency_report' | 'public_transcript' | 'official_statement' | 'other_public';
export type ChallengeBasis = 'omitted_material_evidence' | 'source_misread' | 'time_window_error' | 'source_became_inaccessible' | 'finding_not_supported' | 'climate_transition_misclassified' | 'conflict_of_evidence';
export type DimensionKey = 'participation_health' | 'conflict_temperature' | 'resolution_reliability' | 'governance_legitimacy' | 'contributor_continuity' | 'narrative_coherence';

export interface Community {
  id: number;
  owner: string;
  slug: string;
  name: string;
  description: string;
  governance_url: string;
  status: 'active' | 'paused' | 'archived';
  active_source_set_id: number;
  policy_version: number;
  current_climate: Climate;
  current_posture: Posture;
  latest_epoch_id: number;
  created_at: number;
}

export interface Source {
  id: number;
  community_id: number;
  source_type: SourceType;
  url: string;
  label: string;
  status: 'active' | 'disabled' | 'superseded';
  added_by: string;
  added_at: number;
}

export interface SourceSet {
  id: number;
  community_id: number;
  version: number;
  source_ids: number[];
  source_count: number;
  created_at: number;
  frozen: boolean;
}

export interface Epoch {
  id: number;
  community_id: number;
  label: string;
  window_start: number;
  window_end: number;
  source_set_id: number;
  previous_epoch_id: number;
  assessment_policy_version: number;
  status: EpochStatus;
  opened_by: string;
  opened_at: number;
  assessed_at: number;
  challenge_deadline: number;
  challenge_count: number;
}

export interface SupportingFinding {
  source_id: number;
  dimension: DimensionKey;
  finding_code: string;
  support: 'positive' | 'negative' | 'mixed';
}

export interface Contradiction {
  source_ids: number[];
  code: string;
}

export interface Verdict {
  schema_version: number;
  climate: Climate;
  direction: Direction;
  operational_posture: Posture;
  confidence: number;
  evidence_coverage_band: CoverageBand;
  accessible_source_count: number;
  failed_source_count: number;
  dimensions: Record<DimensionKey, string>;
  material_risk_flags: string[];
  supporting_findings: SupportingFinding[];
  contradictions: Contradiction[];
  challenge_recommended: boolean;
  short_reason: string;
}

export interface Challenge {
  id: number;
  epoch_id: number;
  community_id: number;
  challenger: string;
  challenge_basis: ChallengeBasis;
  disputed_dimension: string;
  new_evidence_urls: string[];
  materiality_statement: string;
  status: 'pending' | 'resolved';
  outcome: string;
  created_at: number;
}

export interface Counts {
  communities: number;
  sources: number;
  source_sets: number;
  epochs: number;
  challenges: number;
}

export interface PosturePolicy {
  stable: Posture;
  strengthening: Posture;
  strained: Posture;
  eroding: Posture;
  fragile: Posture;
  critical: Posture;
  inconclusive: Posture;
}
