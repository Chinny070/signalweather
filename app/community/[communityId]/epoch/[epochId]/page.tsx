'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getEpoch, getEpochVerdict, getCommunity, getSourceSet, getSource, requestAssessment } from '@/lib/contract';
import { useWallet } from '@/components/wallet/WalletProvider';
import { TransactionStatus, type TxPhase } from '@/components/tx/TransactionStatus';
import type { Epoch, Verdict, Community, Source, Climate, Posture, Direction, DimensionKey } from '@/lib/genlayer/types';
import { ClimateField } from '@/components/climate/ClimateField';
import { TrustCrossSection } from '@/components/climate/TrustCrossSection';
import { EvidenceLedger } from '@/components/climate/EvidenceLedger';
import { OperationalGate } from '@/components/climate/OperationalGate';
import { formatEpochWindow } from '@/lib/formatting/climate';

export default function EpochPage({ params }: { params: Promise<{ communityId: string; epochId: string }> }) {
  const { communityId, epochId } = use(params);
  const { address } = useWallet();
  const [epoch, setEpoch] = useState<Epoch | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessPhase, setAssessPhase] = useState<TxPhase | null>(null);
  const [assessHash, setAssessHash] = useState<string | undefined>();
  const [assessError, setAssessError] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      try {
        const [e, c] = await Promise.all([getEpoch(epochId), getCommunity(communityId)]);
        setEpoch(e);
        setCommunity(c);

        const v = await getEpochVerdict(epochId);
        setVerdict(v);

        if (e.source_set_id) {
          const ss = await getSourceSet(String(e.source_set_id));
          const srcs = await Promise.all(ss.source_ids.map((id) => getSource(String(id))));
          setSources(srcs);
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [communityId, epochId]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12 text-muted">Loading epoch...</div>;
  if (!epoch || !community) return <div className="max-w-7xl mx-auto px-4 py-12 text-muted">Epoch not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-muted mb-4">
        <Link href={`/community/${communityId}`} className="hover:text-foreground">{community.name}</Link>
        <span>/</span>
        <span>{epoch.label}</span>
      </div>

      <div className="instrument-band p-4 mb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-medium text-lg">Epoch: {epoch.label}</h1>
            <p className="text-xs font-data text-muted mt-1">
              {formatEpochWindow(epoch.window_start, epoch.window_end)}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className={`px-2 py-0.5 uppercase tracking-wider border ${
              epoch.status === 'accepted' ? 'border-stable/30 text-stable' :
              epoch.status === 'undetermined' ? 'border-critical/30 text-critical' :
              'border-border text-muted'
            }`}>
              {epoch.status}
            </span>
            <span className="font-data text-muted">Source set #{epoch.source_set_id}</span>
            <span className="font-data text-muted">Policy v{epoch.assessment_policy_version}</span>
          </div>
        </div>
      </div>

      {verdict ? (
        <>
          <ClimateField
            climate={verdict.climate as Climate}
            posture={verdict.operational_posture as Posture}
            direction={verdict.direction as Direction}
            epochLabel={epoch.label}
            communityName={community.name}
          />
          <div className="grid lg:grid-cols-3 gap-3 mt-3">
            <div className="lg:col-span-2 space-y-3">
              <TrustCrossSection dimensions={verdict.dimensions as Record<DimensionKey, string>} />
              <EvidenceLedger findings={verdict.supporting_findings} sources={sources} />
              {verdict.contradictions.length > 0 && (
                <div className="instrument-band p-4">
                  <h3 className="text-xs uppercase tracking-widest text-muted mb-3">Contradictions</h3>
                  {verdict.contradictions.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm mb-1">
                      <span className="text-strained">▸</span>
                      <span className="font-data">Sources #{c.source_ids.join(', #')}</span>
                      <span className="text-muted">—</span>
                      <span>{c.code.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <OperationalGate
                posture={verdict.operational_posture as Posture}
                policyVersion={epoch.assessment_policy_version}
              />
              <div className="instrument-band p-4">
                <h3 className="text-xs uppercase tracking-widest text-muted mb-2">Assessment Detail</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Confidence</span>
                    <span className="font-data">{verdict.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Coverage</span>
                    <span className="font-data uppercase">{verdict.evidence_coverage_band}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Sources accessible</span>
                    <span className="font-data">{verdict.accessible_source_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Sources failed</span>
                    <span className="font-data">{verdict.failed_source_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Challenge recommended</span>
                    <span className="font-data">{verdict.challenge_recommended ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted leading-relaxed">{verdict.short_reason}</p>
              </div>
              {epoch.status === 'accepted' && (
                <Link
                  href={`/manage/${communityId}/challenge/${epochId}`}
                  className="block instrument-band p-4 text-center text-sm text-challenge hover:bg-challenge/5 transition-colors"
                >
                  Challenge this verdict →
                </Link>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="instrument-band p-8 text-center">
          <p className="text-muted mb-4">
            {epoch.status === 'collecting' ? 'Epoch is collecting. Assessment not yet requested.' :
             epoch.status === 'assessment_pending' ? 'Assessment pending consensus...' :
             'No verdict available.'}
          </p>
          {epoch.status === 'collecting' && address && community && (
            <>
              <button
                onClick={async () => {
                  setAssessPhase('preparing');
                  setAssessHash(undefined);
                  setAssessError(undefined);
                  try {
                    setAssessPhase('wallet_confirm');
                    const outcome = await requestAssessment(epochId);
                    setAssessHash(outcome.hash);
                    if (outcome.success) {
                      setAssessPhase('accepted');
                      setEpoch({ ...epoch, status: 'accepted' });
                      const v = await getEpochVerdict(epochId);
                      setVerdict(v);
                    } else {
                      setAssessPhase('error');
                      setAssessError(outcome.error ?? 'Assessment failed');
                    }
                  } catch (err) {
                    setAssessPhase('error');
                    setAssessError(err instanceof Error ? err.message : 'Unknown error');
                  }
                }}
                disabled={assessPhase === 'wallet_confirm' || assessPhase === 'submitted' || assessPhase === 'pending_consensus'}
                className="bg-consensus text-background px-6 py-3 text-xs uppercase tracking-widest font-medium clip-corner hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Assessment
              </button>
              {assessPhase && (
                <div className="mt-4 max-w-md mx-auto">
                  <TransactionStatus phase={assessPhase} hash={assessHash} error={assessError} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
