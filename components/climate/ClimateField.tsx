'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Climate, Posture, Direction } from '@/lib/genlayer/types';
import { CLIMATE_CONFIG } from '@/lib/formatting/climate';
import { ClimateBadge } from './ClimateBadge';
import { PostureBadge } from './PostureBadge';

interface ClimateFieldProps {
  climate: Climate;
  posture: Posture;
  direction: Direction;
  epochLabel?: string;
  communityName?: string;
}

function ParticleField({ color, intensity }: { color: string; intensity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    const count = Math.floor(20 + intensity * 40);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (0.3 + intensity * 0.5),
        vy: (Math.random() - 0.5) * (0.2 + intensity * 0.3),
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [color, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}

const INTENSITY_MAP: Record<Climate, number> = {
  stable: 0.1,
  strengthening: 0.2,
  strained: 0.4,
  eroding: 0.6,
  fragile: 0.75,
  critical: 0.9,
  inconclusive: 0.15,
};

const DIRECTION_ARROWS: Record<Direction, string> = {
  improving: '↑',
  unchanged: '→',
  worsening: '↓',
  volatile: '↕',
  unknown: '·',
};

export function ClimateField({ climate, posture, direction, epochLabel, communityName }: ClimateFieldProps) {
  const config = CLIMATE_CONFIG[climate];
  const intensity = INTENSITY_MAP[climate];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full overflow-hidden instrument-band"
      style={{ minHeight: 260 }}
    >
      <div className="absolute inset-0 grid-bg opacity-40" />
      <ParticleField color={config.color} intensity={intensity} />

      <div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-8" style={{ minHeight: 260 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {communityName && (
              <p className="text-xs uppercase tracking-widest text-muted mb-1">{communityName}</p>
            )}
            <h2
              className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight"
              style={{ color: config.color }}
            >
              {config.label}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PostureBadge posture={posture} />
            {epochLabel && (
              <span className="text-xs font-data text-muted">{epochLabel}</span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between mt-8 gap-4 flex-wrap">
          <div className="flex items-center gap-6">
            <ClimateBadge climate={climate} size="lg" />
            <span className="text-2xl" style={{ color: config.color }}>{DIRECTION_ARROWS[direction]}</span>
            <span className="text-sm text-muted uppercase tracking-wider">
              {direction}
            </span>
          </div>
          <p className="text-xs text-muted max-w-xs text-right">
            {config.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
