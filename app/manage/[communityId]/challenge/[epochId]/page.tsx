'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWallet } from '@/components/wallet/WalletProvider';
import { TransactionStatus, type TxPhase } from '@/components/tx/TransactionStatus';
import { ClimateBadge } from '@/components/climate/ClimateBadge';
import { PostureBadge } from '@/components/climate/PostureBadge';
import {
  getCommunity, getEpoch, getEpochVerdict, openChallenge,
  requestReassessment, getCounts,
} from '@/lib/contract';
import { DIMENSION_LABELS, DIRECTION_LABELS, COVERAGE_LABELS } from '@/lib/formatting/climate';
import type { Community, Epoch, Verdict, ChallengeBasis, DimensionKey } from '@/lib/genlayer/types';

const CHALLENGE_BASES: { value: ChallengeBasis; label: string }[] = [
  { value: 'omitted_material_evidence', label: 'Omitted Material Evidence' },
  { value: 'source_misread', label: 'Source Misread' },
  { value: 'time_window_error', label: 'Time Window Error' },
  { value: 'source_became_inaccessible', label: 'Source Became Inaccessible' },
  { value: 'finding_not_supported', label: 'Finding Not Supported' },
  { value: 'climate_transition_misclassified', label: 'Climate Transition Misclassified' },
  { value: 'conflict_of_evidence', label: 'Conflict of Evidence' },
];

const DIMENSION_KEYS: { value: DimensionKey; label: string }[] = Object.entries(DIMENSION_LABELS).map(
  ([value, label]) => ({ value: value as DimensionKey, label })
);

const schema = z.object({
  challengeBasis: z.enum([
    'omitted_material_evidence', 'source_misread', 'time_window_error',
    'source_became_inaccessible', 'finding_not_supported',
    'climate_transition_misclassified', 'conflict_of_evidence',
  ] as const),
  disputedDimension: z.enum([
    'participation_health', 'conflict_temperature', 'resolution_reliability',
    'governance_legitimacy', 'contributor_continuity', 'narrative_coherence',
  ] as const),
  evidenceUrls: z.array(z.object({
    url: z.string().url('Must be a valid URL'),
  })).min(1, 'At least one evidence URL is required'),
  materialityStatement: z
    .string()
    .min(20, 'Materiality statement must be at least 20 characters')
    .max(1000, 'Materiality statement must be 1000 characters or fewer'),
});

type FormData = z.infer<typeof schema>;

export default function ChallengePage() {
  const params = useParams<{ communityId: string; epochId: string }>();
  const { communityId, epochId } = params;
  const { address, isCorrectNetwork, connect, switchNetwork, isConnecting } = useWallet();

  const [community, setCommunity] = useState<Community | null>(null);
  const [epoch, setEpoch] = useState<Epoch | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Challenge tx
  const [txPhase, setTxPhase] = useState<TxPhase | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txError, setTxError] = useState<string | undefined>();
  const [challengeId, setChallengeId] = useState<string | null>(null);

  // Reassessment tx
  const [reassessPhase, setReassessPhase] = useState<TxPhase | null>(null);
  const [reassessHash, setReassessHash] = useState<string | undefined>();
  const [reassessError, setReassessError] = useState<string | undefined>();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      evidenceUrls: [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'evidenceUrls',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [comm, ep, verd] = await Promise.all([
        getCommunity(communityId),
        getEpoch(epochId),
        getEpochVerdict(epochId).catch(() => null),
      ]);
      setCommunity(comm);
      setEpoch(ep);
      setVerdict(verd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load epoch data');
    } finally {
      setLoading(false);
    }
  }, [communityId, epochId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function onSubmit(data: FormData) {
    setTxPhase('preparing');
    setTxHash(undefined);
    setTxError(undefined);

    const urlsJson = JSON.stringify(data.evidenceUrls.map((e) => e.url));

    try {
      setTxPhase('wallet_confirm');
      const outcome = await openChallenge(
        epochId,
        data.challengeBasis,
        data.disputedDimension,
        urlsJson,
        data.materialityStatement,
      );
      setTxHash(outcome.hash);

      if (outcome.success) {
        setTxPhase('accepted');
        const counts = await getCounts();
        setChallengeId(String(counts.challenges));
      } else {
        setTxPhase('error');
        setTxError(outcome.error ?? 'Transaction failed');
      }
    } catch (err) {
      setTxPhase('error');
      setTxError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  // ── WALLET GUARDS ──
  if (!address) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="instrument-band p-6">
          <p className="text-sm text-muted mb-4">Connect your wallet to submit a challenge.</p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest font-medium clip-corner hover:bg-stable transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="instrument-band p-6 border-strained/30">
          <p className="text-sm text-strained mb-4">Wrong network. Switch to GenLayer StudioNet.</p>
          <button
            onClick={switchNetwork}
            className="bg-strained text-background px-5 py-2.5 text-xs uppercase tracking-widest font-medium clip-corner hover:opacity-90 transition-opacity"
          >
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="instrument-band p-6 animate-pulse">
          <div className="h-4 bg-surface-raised rounded w-1/3 mb-3" />
          <div className="h-3 bg-surface-raised rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !community || !epoch) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="instrument-band p-6 border-critical/30">
          <p className="text-sm text-critical">{error ?? 'Epoch not found'}</p>
          <button onClick={loadData} className="mt-3 text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* ── HEADER ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href={`/manage/${communityId}`}
            className="text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors font-data"
          >
            {community.name}
          </Link>
          <span className="text-muted">/</span>
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-data">
            Challenge Epoch #{epoch.id}
          </span>
        </div>
        <h1 className="font-display text-3xl text-foreground">Open Challenge</h1>
        <div className="mt-3 h-px bg-border" />
      </div>

      {/* ── CURRENT VERDICT ── */}
      {verdict ? (
        <div className="instrument-band p-5 mb-8">
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
            Current Verdict for Epoch #{epoch.id}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted mb-1">Climate</p>
              <ClimateBadge climate={verdict.climate} size="sm" />
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Direction</p>
              <span className="text-sm font-data">{DIRECTION_LABELS[verdict.direction]}</span>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Posture</p>
              <PostureBadge posture={verdict.operational_posture} />
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Coverage</p>
              <span className="text-sm font-data">{COVERAGE_LABELS[verdict.evidence_coverage_band]}</span>
            </div>
          </div>
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted mb-1">Confidence</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                <div
                  className="h-full bg-consensus rounded-full"
                  style={{ width: `${Math.round(verdict.confidence * 100)}%` }}
                />
              </div>
              <span className="text-xs font-data text-foreground">
                {Math.round(verdict.confidence * 100)}%
              </span>
            </div>
          </div>
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted mb-1">Reason</p>
            <p className="text-sm text-foreground/80">{verdict.short_reason}</p>
          </div>
          {verdict.material_risk_flags.length > 0 && (
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-muted mb-1">Material Risk Flags</p>
              <div className="flex flex-wrap gap-2">
                {verdict.material_risk_flags.map((flag, i) => (
                  <span key={i} className="text-xs font-data px-2 py-0.5 bg-critical/10 text-critical border border-critical/20">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Dimensions */}
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted mb-2">Dimensions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(verdict.dimensions).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-xs">
                  <span className="text-muted">{DIMENSION_LABELS[key as DimensionKey] ?? key}</span>
                  <span className="font-data text-foreground/80">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="instrument-band p-5 mb-8 border-strained/30">
          <p className="text-sm text-strained">
            No verdict found for this epoch. A verdict must exist before it can be challenged.
          </p>
        </div>
      )}

      {/* ── CHALLENGE FORM ── */}
      {verdict && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted font-data">Challenge Details</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Challenge Basis */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
                Challenge Basis
              </label>
              <select
                {...register('challengeBasis')}
                className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data focus:outline-none focus:border-challenge/50 transition-colors appearance-none"
              >
                <option value="">Select basis...</option>
                {CHALLENGE_BASES.map((cb) => (
                  <option key={cb.value} value={cb.value}>
                    {cb.label}
                  </option>
                ))}
              </select>
              {formErrors.challengeBasis && (
                <p className="mt-1.5 text-xs text-critical">{formErrors.challengeBasis.message}</p>
              )}
            </div>

            {/* Disputed Dimension */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
                Disputed Dimension
              </label>
              <select
                {...register('disputedDimension')}
                className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data focus:outline-none focus:border-challenge/50 transition-colors appearance-none"
              >
                <option value="">Select dimension...</option>
                {DIMENSION_KEYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              {formErrors.disputedDimension && (
                <p className="mt-1.5 text-xs text-critical">{formErrors.disputedDimension.message}</p>
              )}
            </div>

            {/* Evidence URLs */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
                New Evidence URLs
              </label>
              <div className="space-y-2">
                {fields.map((field: { id: string; url: string }, index: number) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      {...register(`evidenceUrls.${index}.url`)}
                      placeholder="https://evidence.example.com/..."
                      className="flex-1 bg-surface-raised border border-border px-4 py-3 text-sm text-foreground font-data placeholder:text-muted/50 focus:outline-none focus:border-challenge/50 transition-colors"
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-xs text-critical/70 hover:text-critical transition-colors px-2 py-3 shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {formErrors.evidenceUrls && (
                  <p className="text-xs text-critical">
                    {formErrors.evidenceUrls.message ?? formErrors.evidenceUrls.root?.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => append({ url: '' })}
                className="mt-2 text-xs uppercase tracking-widest text-consensus hover:text-foreground transition-colors"
              >
                + Add Evidence URL
              </button>
            </div>

            {/* Materiality Statement */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
                Materiality Statement
              </label>
              <textarea
                {...register('materialityStatement')}
                rows={5}
                placeholder="Explain why this challenge is material to the verdict. Describe the specific evidence or reasoning that was missed or misinterpreted, and how it changes the climate assessment."
                className="w-full bg-surface-raised border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-challenge/50 transition-colors resize-none"
              />
              {formErrors.materialityStatement && (
                <p className="mt-1.5 text-xs text-critical">{formErrors.materialityStatement.message}</p>
              )}
            </div>

            <div className="h-px bg-border" />

            <button
              type="submit"
              disabled={isSubmitting || (txPhase !== null && txPhase !== 'accepted' && txPhase !== 'error')}
              className="bg-challenge text-background px-6 py-3 text-xs uppercase tracking-widest font-medium clip-corner hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
            </button>

            {txPhase && (
              <div className="mt-4">
                <TransactionStatus phase={txPhase} hash={txHash} error={txError} />
              </div>
            )}

            {txPhase === 'accepted' && challengeId && (
              <div className="mt-4 instrument-band p-4 border-stable/30">
                <p className="text-sm text-stable mb-3">
                  Challenge #{challengeId} submitted successfully. Request a reassessment to have validators re-evaluate with the new evidence.
                </p>

                <button
                  onClick={async () => {
                    setReassessPhase('preparing');
                    setReassessHash(undefined);
                    setReassessError(undefined);
                    try {
                      setReassessPhase('wallet_confirm');
                      const outcome = await requestReassessment(challengeId);
                      setReassessHash(outcome.hash);
                      if (outcome.success) {
                        setReassessPhase('accepted');
                      } else if (outcome.pending) {
                        setReassessPhase('pending_long');
                      } else {
                        setReassessPhase('error');
                        setReassessError(outcome.error ?? 'Reassessment failed');
                      }
                    } catch (err) {
                      setReassessPhase('error');
                      setReassessError(err instanceof Error ? err.message : 'Unknown error');
                    }
                  }}
                  disabled={reassessPhase === 'wallet_confirm' || reassessPhase === 'submitted' || reassessPhase === 'pending_consensus' || reassessPhase === 'accepted' || reassessPhase === 'pending_long'}
                  className="bg-consensus text-background px-6 py-3 text-xs uppercase tracking-widest font-medium clip-corner hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reassessPhase === 'accepted' ? 'Reassessment Complete' : 'Request Reassessment'}
                </button>

                {reassessPhase && (
                  <div className="mt-3">
                    <TransactionStatus phase={reassessPhase} hash={reassessHash} error={reassessError} />
                  </div>
                )}

                {reassessPhase === 'accepted' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-stable mb-2">Reassessment complete. Validators have re-evaluated the evidence.</p>
                    <Link
                      href={`/community/${communityId}/epoch/${epochId}`}
                      className="text-xs uppercase tracking-widest text-stable hover:underline font-data"
                    >
                      View Updated Verdict →
                    </Link>
                  </div>
                )}

                {!reassessPhase && (
                  <Link
                    href={`/manage/${communityId}`}
                    className="mt-3 inline-block text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors font-data"
                  >
                    Return to Dashboard →
                  </Link>
                )}
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
