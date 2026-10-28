'use client';
import { useEffect, useRef, useState } from 'react';
import { DOMAIN_META, DOMAINS, TYPE_LABEL, domainOfType } from '@/lib/domains';

type Seed = { id: string; name: string; type: string; image?: string };
const FILTERS = [{ v: '', l: 'Everything' }, ...['artist', 'movie', 'tv_show', 'place', 'brand', 'book', 'podcast', 'video_game', 'destination'].map((v) => ({ v, l: TYPE_LABEL[v] }))];

export default function Builder({ initial = [], mode = 'create', returnTo }: { initial?: Seed[]; mode?: 'create' | 'rebuild'; returnTo?: string }) {
  const [seeds, setSeeds] = useState<Seed[]>(initial);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState<Seed[]>([]);
  const [searching, setSearching] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [key, setKey] = useState<string | null>(null);
  const tm = useRef<any>(null);

  useEffect(() => {
    clearTimeout(tm.current);
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    tm.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`).then((r) => r.json());
        setResults(r.results || []); setDegraded(!!r.degraded);
      } catch { setDegraded(true); }
      setSearching(false);
    }, 280);
  }, [q, type]);

  const add = (s: Seed) => { if (seeds.length < 10 && !seeds.some((x) => x.id === s.id)) setSeeds([...seeds, s]); setQ(''); setResults([]); };
  const covered = new Set(seeds.map((s) => domainOfType(s.type)));

  async function submit() {
    setBusy(true); setError('');
    try {
      const res = await fetch(mode === 'create' ? '/api/passport/create' : '/api/passport/rebuild', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ seeds }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Something went wrong');
      if (mode === 'create') setKey(j.recoveryKey); else location.href = '/me';
    } catch (e: any) { setError(e.message); }
    setBusy(false);
  }

  if (key) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-line/15 bg-card p-6 text-center">
        <div className="stamp mx-auto">Issued</div>
        <h2 className="mt-4 font-display text-3xl font-semibold">Your TasteID is ready.</h2>
        <p className="mt-2 text-sm text-mute">Save this recovery key — it is shown once and is the only way to restore your TasteID on another device. We store only a hash.</p>
        <code className="mt-4 block break-all rounded-xl bg-ink/5 p-3 font-mono text-sm select-all">{key}</code>
        <button className="btn-ghost mt-3" onClick={() => navigator.clipboard?.writeText(key)}>Copy key</button>
        <div className="mt-5"><a className="btn-primary" href={returnTo || '/me'}>{returnTo ? 'Continue' : 'See my passport →'}</a></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-line/15 bg-card p-4 sm:p-6">
        <label className="font-mono text-[11px] uppercase tracking-widest text-mute">Name things you love</label>
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="A band, a movie, a restaurant, a brand, a game…" className="mt-2 w-full rounded-2xl border border-line/20 bg-paper px-4 py-3 text-lg outline-none focus:border-accent" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => <button key={f.v} onClick={() => setType(f.v)} className={`chip ${type === f.v ? 'border-accent bg-accent text-white' : ''}`}>{f.l}</button>)}
        </div>
        <div className="mt-3 min-h-[3rem]">
          {searching && <div className="skeleton h-10 w-full" />}
          {!searching && degraded && <p className="text-sm text-mute">The taste graph is unreachable right now — please try again in a moment.</p>}
          {!searching && !degraded && q.length >= 2 && results.length === 0 && <p className="text-sm text-mute">No matches. Try another spelling or category.</p>}
          <div className="flex flex-wrap gap-2">
            {results.map((r) => (
              <button key={r.id} onClick={() => add(r)} className="chip bg-paper hover:border-accent"><span className="text-mute">{TYPE_LABEL[r.type] || r.type}</span> {r.name} <span className="text-accent">＋</span></button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between"><h3 className="font-display text-xl font-semibold">Your picks <span className="text-mute">({seeds.length}/10)</span></h3><span className="text-xs text-mute">3–10 needed</span></div>
        <div className="mt-3 flex min-h-[3rem] flex-wrap gap-2">
          {seeds.length === 0 && <p className="text-sm text-mute">Nothing yet. Mix it up — the more domains, the richer your passport.</p>}
          {seeds.map((s) => (
            <span key={s.id} className="chip border-accent/60 bg-accent/10"><span className="text-mute">{TYPE_LABEL[s.type]}</span> {s.name}
              <button aria-label={`Remove ${s.name}`} onClick={() => setSeeds(seeds.filter((x) => x.id !== s.id))} className="ml-1 text-mute hover:text-accent">✕</button></span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {DOMAINS.map((d) => <span key={d} className={`chip ${covered.has(d) ? 'border-accent text-accent' : 'text-mute'}`}>{DOMAIN_META[d].stamp} {DOMAIN_META[d].label}</span>)}
        </div>
        {covered.size < 3 && seeds.length >= 2 && <p className="mt-2 text-xs text-mute">Tip: add something from a different domain — variety unlocks better cross-domain discoveries.</p>}
      </div>

      {error && <p className="mt-4 rounded-xl bg-accent/10 p-3 text-sm text-accent">{error}</p>}
      <button disabled={busy || seeds.length < 3} onClick={submit} className="btn-primary mt-6 w-full py-3.5 text-base sm:w-auto">
        {busy ? 'Mapping your taste across domains…' : mode === 'create' ? 'Issue my TasteID' : 'Rebuild my TasteID'}
      </button>
    </div>
  );
}
