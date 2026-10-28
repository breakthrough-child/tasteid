'use client';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';

type Cfg = { id: string; name: string; tagline: string; color: string; domain: string; scope: string; noun: string; cities?: string[] };
type Item = { id: string; name: string; type: string; popularity?: number; image?: string; why?: string; affinity?: number };

export default function DemoApp({ cfg }: { cfg: Cfg }) {
  const [catalog, setCatalog] = useState<Item[] | null>(null);
  const [city, setCity] = useState(cfg.cities?.[0] || '');
  const [err, setErr] = useState('');
  const [rec, setRec] = useState<Item[] | null>(null);
  const [recErr, setRecErr] = useState('');
  const [loadingRec, setLoadingRec] = useState(false);
  const session = useRef<any>(null);

  useEffect(() => {
    setCatalog(null); setErr(''); setRec(null);
    fetch(`/api/demo/catalog?app=${cfg.id}${city ? `&city=${encodeURIComponent(city)}` : ''}`).then(async (r) => {
      if (!r.ok) throw new Error();
      const j = await r.json();
      setCatalog((j.items as Item[]).slice(0, cfg.id === 'forkful' ? 12 : 40));
    }).catch(() => setErr('We couldn’t load this catalog right now. Please try again shortly.'));
  }, [cfg.id, city]);

  const personalize = useCallback(async (items: Item[]) => {
    if (!session.current || !items.length) return;
    setLoadingRec(true); setRecErr('');
    const res = await session.current.api.recommend({ domain: cfg.domain, candidates: items.map((i) => ({ id: i.id, type: i.type, name: i.name })), context: { city }, take: 40 });
    if (res.error) setRecErr(res.error === 'insufficient_scope' ? 'You didn’t share this domain with the app.' : 'Personalization failed — your access may have been revoked.');
    else setRec(res.items);
    setLoadingRec(false);
  }, [cfg.domain, city]);

  useEffect(() => {
    const h = (e: any) => { session.current = e.detail; };
    document.addEventListener('tasteid:signin', h);
    const h2 = (e: any) => { session.current = e.detail; if (catalog) personalize(catalog); };
    document.addEventListener('tasteid:signin', h2);
    return () => { document.removeEventListener('tasteid:signin', h); document.removeEventListener('tasteid:signin', h2); };
  }, [catalog, personalize]);
  useEffect(() => { if (session.current && catalog) personalize(catalog); }, [catalog, personalize]);

  const left = (catalog || []).slice().sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 10);
  const cityEmpty = cfg.id === 'forkful' && catalog && catalog.length === 0;

  return (
    <div style={{ ['--app' as any]: cfg.color }}>
      <Script src="/sdk/tasteid.js" strategy="afterInteractive" onLoad={() => (window as any).TasteID?.scan()} />
      <div className="px-4 py-8 text-white" style={{ background: cfg.color }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <div><div className="font-display text-3xl font-bold">{cfg.name}</div><div className="text-sm opacity-90">{cfg.tagline}</div></div>
          {cfg.cities && <select value={city} onChange={(e) => setCity(e.target.value)} className="ml-auto rounded-full bg-white/20 px-3 py-2 text-sm text-white">{cfg.cities.map((c) => <option key={c} className="text-black">{c}</option>)}</select>}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-3 text-xs text-mute">Demo app built to show TasteID integration · fictional brand · integrates only via the public SDK + API.</div>
      {err && <p className="mx-auto max-w-6xl px-4 text-accent">{err}</p>}
      {cityEmpty && <p className="mx-auto max-w-6xl px-4 py-6 text-mute">No data for this city yet — try New York, London or Los Angeles.</p>}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-6 md:grid-cols-2">
        <section className="rounded-3xl border border-line/15 bg-card p-5">
          <div className="font-mono text-[11px] uppercase tracking-widest text-mute">Before — what every new user sees</div>
          <h2 className="mt-1 font-display text-xl font-semibold">Popular {cfg.noun}</h2>
          <List items={catalog ? left : null} color={cfg.color} />
        </section>
        <section className="rounded-3xl border-2 bg-card p-5" style={{ borderColor: cfg.color }}>
          <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: cfg.color }}>After — Sign in with Taste</div>
          <h2 className="mt-1 font-display text-xl font-semibold">Picked for you</h2>
          {!rec && (
            <div className="my-6 text-center">
              <p className="mb-3 text-sm text-mute">{loadingRec ? 'Re-ranking with your taste…' : `Connect your TasteID to re-rank ${cfg.noun} instantly. No account needed.`}</p>
              <div data-tasteid-button data-client-id={cfg.id} data-scopes={cfg.scope} />
              {recErr && <p className="mt-2 text-sm text-accent">{recErr}</p>}
            </div>
          )}
          {loadingRec && <div className="skeleton h-40 w-full" />}
          {rec && <List items={rec.slice(0, 10)} color={cfg.color} why />}
        </section>
      </div>
    </div>
  );
}

function List({ items, color, why }: { items: Item[] | null; color: string; why?: boolean }) {
  if (!items) return <div className="mt-3 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>;
  return (
    <ol className="mt-3 space-y-2">
      {items.map((it, i) => (
        <li key={it.id} className="flex items-start gap-3 rounded-xl border border-line/10 p-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-xs text-white" style={{ background: color }}>{i + 1}</span>
          <div className="min-w-0"><div className="font-semibold">{it.name}</div>
            {why && it.why && <div className="text-xs text-mute">{it.why}</div>}</div>
          {why && typeof it.affinity === 'number' && <span className="ml-auto font-mono text-xs" style={{ color }}>{Math.round(it.affinity * 100)}%</span>}
        </li>
      ))}
    </ol>
  );
}
