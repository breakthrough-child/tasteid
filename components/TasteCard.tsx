import { DOMAINS, DOMAIN_META } from '@/lib/domains';
import type { Profile } from '@/lib/taste/build-profile';

export default function TasteCard({ id, profile }: { id: string; profile: Profile }) {
  const num = id.replace(/-/g, '').slice(0, 12).toUpperCase().match(/.{1,4}/g)!.join(' ');
  return (
    <div className="card-ink relative overflow-hidden rounded-3xl p-6 shadow-2xl sm:p-8">
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[.3em] opacity-70">TasteID · Passport</div>
          <div className="holo grid h-10 w-10 place-items-center rounded-full text-[#0b0d17]">✦</div>
        </div>
        <h2 className="mt-6 font-display text-3xl font-semibold leading-tight sm:text-4xl">{profile.archetype.label}</h2>
        <p className="mt-2 max-w-md text-sm opacity-80">{profile.archetype.blurb}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {profile.dna.slice(0, 8).map((t) => <span key={t} className="rounded-full border border-white/25 px-2.5 py-0.5 text-xs">{t}</span>)}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {DOMAINS.filter((d) => profile.domains[d]?.entities.length).map((d) => (
            <span key={d} className="stamp" style={{ transform: `rotate(${(d.length % 5) - 2}deg)` }}>{DOMAIN_META[d].stamp} {DOMAIN_META[d].label}</span>
          ))}
        </div>
        <div className="mt-8 flex items-end justify-between font-mono text-sm tracking-[.2em]">
          <span>{num}</span><span className="text-[10px] opacity-60">NO NAME · NO EMAIL</span>
        </div>
      </div>
    </div>
  );
}
