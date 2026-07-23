import { CLIMATE_CONFIG, POSTURE_CONFIG, DIMENSION_LABELS } from '@/lib/formatting/climate';
import type { Climate, Posture, DimensionKey } from '@/lib/genlayer/types';

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl md:text-5xl mb-6">Methodology</h1>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-display text-2xl mb-3">What SignalWeather measures</h2>
          <p className="text-muted">
            SignalWeather does not measure sentiment. It does not ask an AI whether a community
            &ldquo;feels healthy.&rdquo; Instead, it independently fetches registered public governance evidence
            and uses GenLayer validators to reach consensus on six bounded trust dimensions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Trust dimensions</h2>
          <p className="text-muted mb-4">
            Each dimension is assessed independently. Validators must agree on the state
            of each dimension, not just the final climate.
          </p>
          <div className="space-y-2">
            {(Object.keys(DIMENSION_LABELS) as DimensionKey[]).map((key) => (
              <div key={key} className="instrument-band p-4">
                <h3 className="text-base font-medium">{DIMENSION_LABELS[key]}</h3>
                <p className="text-xs font-data text-muted mt-1">{key}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Climate states</h2>
          <p className="text-muted mb-4">
            The final climate is a bounded judgment derived from all dimensions and source quality.
            It is not a mathematical average.
          </p>
          <div className="space-y-2">
            {(Object.keys(CLIMATE_CONFIG) as Climate[]).map((climate) => (
              <div key={climate} className="instrument-band p-4 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: CLIMATE_CONFIG[climate].color }} />
                <div>
                  <h3 className="text-base font-medium uppercase" style={{ color: CLIMATE_CONFIG[climate].color }}>
                    {CLIMATE_CONFIG[climate].label}
                  </h3>
                  <p className="text-xs text-muted mt-1">{CLIMATE_CONFIG[climate].description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Operational postures</h2>
          <p className="text-muted mb-4">
            Each climate maps deterministically to an operational posture via the community&rsquo;s
            registered policy. The LLM does not choose the posture.
          </p>
          <div className="space-y-2">
            {(Object.keys(POSTURE_CONFIG) as Posture[]).map((posture) => (
              <div key={posture} className="instrument-band p-4">
                <h3 className="text-base font-medium uppercase">{POSTURE_CONFIG[posture].label}</h3>
                <p className="text-xs text-muted mt-1">{POSTURE_CONFIG[posture].description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Evidence requirements</h2>
          <p className="text-muted mb-3">
            Validators can only verify evidence they can independently access. Recommended
            public sources include:
          </p>
          <ul className="space-y-1 text-muted">
            {[
              'Discourse governance forums',
              'Snapshot/Tally proposal pages',
              'GitHub issues, discussions, and pull requests',
              'Public incident reports and postmortems',
              'Public transparency reports and community calls',
              'Official statements and RFC threads',
            ].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="text-evidence mt-0.5">▸</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted mt-4">
            Screenshots, copied Discord messages, pasted chat logs, private Telegram messages,
            and login-protected URLs are not independently verifiable and must not determine
            the canonical verdict.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Consensus mechanism</h2>
          <p className="text-muted">
            The leader node fetches all registered sources, builds an evidence packet, and runs
            the assessment prompt. Each validator independently re-fetches the same sources and
            produces its own assessment. Validators compare their result against the leader&rsquo;s
            on stable decision fields (climate, direction, dimension states, coverage band, risk flags).
            If a majority agrees, the verdict is accepted. If not, the transaction becomes
            undetermined and the community&rsquo;s state is unchanged.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Challenges</h2>
          <p className="text-muted">
            A challenge cannot be &ldquo;I disagree.&rdquo; The challenger must provide new public evidence URLs
            and specify a precise basis: omitted material evidence, source misread, time window error,
            inaccessible source, unsupported finding, misclassified transition, or conflicting evidence.
            The contract fetches the challenge evidence and runs a fresh independent assessment.
          </p>
        </section>
      </div>
    </div>
  );
}
