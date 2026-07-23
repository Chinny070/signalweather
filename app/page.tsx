'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllCommunities, getCounts } from '@/lib/contract';
import type { Community, Climate, Posture } from '@/lib/genlayer/types';
import { ClimateBadge } from '@/components/climate/ClimateBadge';
import { PostureBadge } from '@/components/climate/PostureBadge';

export default function HomePage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [counts, setCounts] = useState({ communities: 0, epochs: 0, sources: 0, source_sets: 0, challenges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, ct] = await Promise.all([getAllCommunities(), getCounts()]);
        setCommunities(c);
        setCounts(ct);
      } catch {
        // contract not deployed yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] max-w-4xl">
            Know when trust changes before governance breaks.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted max-w-2xl leading-relaxed">
            SignalWeather uses GenLayer validators to independently inspect public governance evidence
            and reach consensus on whether a community is stable, strained, eroding or approaching
            a critical trust event.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="/climates"
              className="px-6 py-3 text-sm font-medium uppercase tracking-wider bg-stable/10 border border-stable/30 text-stable hover:bg-stable/20 transition-colors clip-corner"
            >
              Explore climates
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 text-sm font-medium uppercase tracking-wider bg-surface-raised border border-border text-foreground hover:bg-border transition-colors clip-corner"
            >
              Register a community
            </Link>
          </div>
        </div>
      </section>

      {/* The failure before the failure */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl md:text-4xl mb-8">The failure before the failure</h2>
          <p className="text-muted mb-8 max-w-2xl">
            Visible crises usually follow earlier signals that went untracked.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Participation collapse',
              'Repeated unresolved conflict',
              'Contradictory leadership communication',
              'Process bypass',
              'Contributor exits',
              'Declining confidence in resolution',
            ].map((signal) => (
              <div key={signal} className="instrument-band p-4">
                <span className="text-strained text-sm mr-2">▸</span>
                <span className="text-sm">{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Not sentiment analysis */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl md:text-4xl mb-8">Not sentiment analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-6 text-muted uppercase tracking-wider text-xs">Ordinary social analytics</th>
                  <th className="text-left py-3 text-stable uppercase tracking-wider text-xs">SignalWeather</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  ['Centralised model', 'Validator consensus'],
                  ['Scraped mentions', 'Registered public evidence'],
                  ['Opaque score', 'Source-aligned findings'],
                  ['No shared state', 'On-chain climate registry'],
                  ['No consequence', 'Operational posture'],
                  ['Not challengeable', 'Source-grounded reassessment'],
                ].map(([left, right]) => (
                  <tr key={left}>
                    <td className="py-3 pr-6 text-muted">{left}</td>
                    <td className="py-3 text-foreground">{right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How a climate is formed */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl md:text-4xl mb-8">How a climate is formed</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { step: '01', title: 'Register sources', desc: 'Add approved public governance URLs to the community source manifest.' },
              { step: '02', title: 'Freeze an epoch', desc: 'Define a time window and lock the source set for independent assessment.' },
              { step: '03', title: 'Validators fetch independently', desc: 'GenLayer validators access each registered URL inside the contract.' },
              { step: '04', title: 'Assess bounded dimensions', desc: 'Participation, conflict, resolution, legitimacy, continuity, coherence.' },
              { step: '05', title: 'Consensus sets climate & posture', desc: 'Accepted verdict updates the on-chain trust state and operational posture.' },
              { step: '06', title: 'Audit the evidence trail', desc: 'Anyone can review source-aligned findings and challenge with new evidence.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="instrument-band p-5">
                <span className="font-data text-xs text-consensus">{step}</span>
                <h3 className="text-base font-medium mt-2 mb-1">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current climate board */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl md:text-4xl mb-8">Current climate board</h2>
          {loading ? (
            <div className="instrument-band p-8 text-center text-muted">Loading communities...</div>
          ) : communities.length === 0 ? (
            <div className="instrument-band p-8 text-center">
              <p className="text-muted mb-4">No communities registered yet.</p>
              <Link href="/register" className="text-sm text-consensus hover:underline">
                Register the first community →
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {communities.map((c) => (
                <Link
                  key={c.id}
                  href={`/community/${c.id}`}
                  className="instrument-band p-5 flex items-center justify-between gap-4 hover:bg-surface-raised/50 transition-colors group"
                >
                  <div>
                    <h3 className="font-medium group-hover:text-stable transition-colors">{c.name}</h3>
                    <p className="text-xs text-muted font-data mt-0.5">{c.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClimateBadge climate={c.current_climate as Climate} size="sm" />
                    <PostureBadge posture={c.current_posture as Posture} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8 text-xs text-muted">
            <span className="font-data">{counts.communities} communities</span>
            <span className="font-data">{counts.epochs} epochs</span>
            <span className="font-data">{counts.sources} sources</span>
            <span className="font-data">{counts.challenges} challenges</span>
          </div>
          <p className="mt-4 text-xs text-muted">
            Powered by <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="text-consensus hover:underline">GenLayer</a> StudioNet · Chain ID 61999
          </p>
        </div>
      </section>
    </div>
  );
}
