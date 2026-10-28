import Link from 'next/link';
import { isMock } from '@/lib/qloo/client';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/10 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="holo grid h-6 w-6 place-items-center rounded-full text-[11px] text-[#0b0d17]">✦</span>TasteID
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm sm:gap-3">
          <Link href="/demo" className="hidden rounded-full px-3 py-1.5 hover:bg-ink/5 sm:block">Demo apps</Link>
          <Link href="/agent" className="hidden rounded-full px-3 py-1.5 hover:bg-ink/5 sm:block">Agent</Link>
          <Link href="/developers" className="hidden rounded-full px-3 py-1.5 hover:bg-ink/5 sm:block">Developers</Link>
          <Link href="/me" className="rounded-full px-3 py-1.5 hover:bg-ink/5">My TasteID</Link>
          <ThemeToggle />
        </nav>
      </div>
      {isMock() && <div className="bg-accent/15 py-1 text-center font-mono text-[11px] text-accent">Demo data — Qloo key pending</div>}
    </header>
  );
}
