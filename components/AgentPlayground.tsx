'use client';
import { useState } from 'react';

type Out = { text: string; trace: { tool: string; input: unknown; output: unknown }[]; fallback?: string; error?: string };
const PROMPTS = ['Plan my Saturday in New York', 'What should I watch tonight?', 'Gift ideas for myself under $100', 'Build me a road-trip playlist and stops'];

export default function AgentPlayground() {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [plain, setPlain] = useState<Out | null>(null);
  const [taste, setTaste] = useState<Out | null>(null);
  const [busy, setBusy] = useState(false);

  async function ask(mode: 'plain' | 'taste', set: (o: Out) => void) {
    try {
      const r = await fetch('/api/agent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt, mode }) });
      const j = await r.json();
      set(r.ok ? j : { text: '', trace: [], error: r.status === 401 ? 'Create your TasteID first to use this pane.' : j.error || 'Something went wrong.' });
    } catch { set({ text: '', trace: [], error: 'Network error. Try again.' }); }
  }
  async function run() {
    setBusy(true); setPlain(null); setTaste(null);
    await Promise.all([ask('plain', setPlain), ask('taste', setTaste)]);
    setBusy(false);
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">{PROMPTS.map((p) => <button key={p} onClick={() => setPrompt(p)} className={`chip ${p === prompt ? 'border-accent bg-accent/10 text-accent' : ''}`}>{p}</button>)}</div>
      <div className="mt-3 flex gap-2">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-w-0 flex-1 rounded-2xl border border-line/20 bg-card px-4 py-3 outline-none focus:border-accent" />
        <button disabled={busy || !prompt} onClick={run} className="btn-primary">{busy ? 'Thinking…' : 'Ask both'}</button>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Pane title="Plain AI" sub="Knows nothing about you" out={plain} busy={busy} />
        <Pane title="AI + your TasteID" sub="Calls TasteID tools" out={taste} busy={busy} accent />
      </div>
    </div>
  );
}

function Pane({ title, sub, out, busy, accent }: { title: string; sub: string; out: Out | null; busy: boolean; accent?: boolean }) {
  return (
    <section className={`rounded-3xl bg-card p-5 ${accent ? 'border-2 border-accent' : 'border border-line/15'}`}>
      <div className="font-display text-xl font-semibold">{title}</div><div className="text-xs text-mute">{sub}</div>
      <div className="mt-4 min-h-[8rem] whitespace-pre-wrap text-sm leading-relaxed">
        {busy && !out && <div className="space-y-2"><div className="skeleton h-4" /><div className="skeleton h-4 w-4/5" /><div className="skeleton h-4 w-3/5" /></div>}
        {!busy && !out && <span className="text-mute">Ask a question to compare.</span>}
        {out?.error && <span className="text-accent">{out.error}</span>}
        {out?.text}
      </div>
      {out?.fallback && <p className="mt-2 text-xs text-mute">⚠ {out.fallback}</p>}
      {!!out?.trace.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {out.trace.map((t, i) => (
            <details key={i} className="chip !block max-w-full bg-paper"><summary className="cursor-pointer font-mono">⚙ {t.tool}</summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all text-[11px]">{JSON.stringify({ input: t.input, output: t.output }, null, 1).slice(0, 2500)}</pre></details>
          ))}
        </div>
      )}
    </section>
  );
}
