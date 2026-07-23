'use client';

import Link from 'next/link';
import { WalletButton } from '@/components/wallet/WalletButton';

export function Header() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-xl tracking-tight text-foreground group-hover:text-stable transition-colors">
              SignalWeather
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/climates" className="text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors">
              Climates
            </Link>
            <Link href="/methodology" className="text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors">
              Methodology
            </Link>
            <Link href="/register" className="text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors">
              Register
            </Link>
          </nav>
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
