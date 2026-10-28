import Link from 'next/link';

const STEPS = [
  ['01', 'Name what you love', 'Three to ten things — a band, a show, a restaurant. About 60 seconds. No name, no email.'],
  ['02', 'Qloo expands it', 'The taste graph maps you across music, film, dining, brands, books, podcasts, games and travel.'],
  ['03', 'Sign in with Taste', 'Any app or AI agent personalizes from the first second — with exactly the domains you allow, revocable anytime.'],
];
export default function Home() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-24">
        <div>
          <div className="stamp">Qloo Agentic Hackathon</div>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] sm:text-7xl">Sign in<br />with <span className="text-accent italic">Taste.</span></h1>
          <p className="mt-6 max-w-lg text-lg text-mute">Every app starts you from zero. TasteID makes your taste travel with you — and you stay in control.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/create" className="btn-primary px-6 py-3 text-base">Create your TasteID</Link><Link href="/demo" className="btn-ghost px-6 py-3 text-base">Try the demo apps</Link></div>
        </div>
        <Mock />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-3xl font-semibold">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map(([n, t, d]) => <div key={n} className="rounded-3xl border border-line/15 bg-card p-6"><div className="font-mono text-accent">{n}</div><h3 className="mt-2 font-display text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-mute">{d}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="card-ink relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="relative z-10 max-w-2xl">
            <div className="stamp">Privacy promise</div>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Your taste. Not your identity.</h2>
            <ul className="mt-4 space-y-2 text-sm opacity-90">
              <li>✓ No name, no email, no phone — a TasteID is anonymous by design.</li>
              <li>✓ Apps see only the domains you tick on the consent screen.</li>
              <li>✓ See every connected app. Revoke in one tap — tokens die instantly.</li>
              <li>✓ Recovery key is hashed. Lose it and we genuinely can’t identify you.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Mock() {
  const screens = [
    { n: 'Reelhouse', c: '#e11d48', a: ['Trending', 'Top 10 today', 'Popular picks'], b: ['Severance', 'Blade Runner 2049', 'Dark'] },
    { n: 'Forkful', c: '#15803d', a: ['Chain Grill', 'Burger Spot', 'Pizza Place'], b: ['Izakaya Moon', 'Quiet Noodle Bar', 'Copper Bistro'] },
    { n: 'Threadline', c: '#2563eb', a: ['Bestsellers', 'New arrivals', 'On sale'], b: ['Patagonia', 'Aesop', 'Carhartt'] },
  ];
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-md" style={{ animation: 'floaty 6s ease-in-out infinite' }}>
      {screens.map((s, i) => (
        <div key={s.n} className="absolute inset-0 overflow-hidden rounded-3xl border border-line/15 bg-card shadow-2xl" style={{ animation: 'cycle 12s infinite', animationDelay: `${i * 4}s`, opacity: 0 }}>
          <div className="px-5 py-4 font-display text-2xl font-bold text-white" style={{ background: s.c }}>{s.n}</div>
          <div className="grid grid-cols-2 gap-3 p-4 text-sm">
            <div><div className="mb-2 font-mono text-[10px] uppercase text-mute">Before</div>{s.a.map((x) => <div key={x} className="mb-2 rounded-lg bg-ink/5 p-3 text-mute">{x}</div>)}</div>
            <div><div className="mb-2 font-mono text-[10px] uppercase text-accent">After ✦ Taste</div>{s.b.map((x) => <div key={x} className="mb-2 rounded-lg border p-3 font-semibold" style={{ borderColor: s.c }}>{x}</div>)}</div>
          </div>
          <div className="px-4"><span className="inline-flex items-center gap-2 rounded-full bg-[#0b0d17] px-4 py-2 text-xs font-semibold text-white ring-1 ring-accent"><span className="holo grid h-5 w-5 place-items-center rounded-full text-[10px] text-black">✦</span>Sign in with Taste</span></div>
        </div>
      ))}
      <div className="absolute inset-0 -z-10 rounded-3xl opacity-30 blur-3xl holo" />
    </div>
  );
}
