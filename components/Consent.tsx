'use client';
import { useState } from 'react';
import { SCOPE_LABEL } from '@/lib/domains';

export default function Consent({ client, scopes, req }: { client: { id: string; name: string; description: string }; scopes: string[]; req: Record<string, string> }) {
  const [on, setOn] = useState<string[]>(scopes);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function submit(deny = false) {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/oauth/consent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...req, scopes: on, deny }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      location.href = j.redirect;
    } catch (e: any) { setErr(e.message || 'Failed'); setBusy(false); }
  }
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl border border-line/15 bg-card p-6">
        <div className="stamp">Sign in with Taste</div>
        <h1 className="mt-3 font-display text-3xl font-semibold">{client.name}</h1>
        <p className="text-sm text-mute">{client.description}</p>
        <h2 className="mt-5 text-sm font-semibold">This app is asking to see</h2>
        <div className="mt-2 space-y-2">
          {scopes.length === 0 && <p className="text-sm text-mute">No valid scopes requested.</p>}
          {scopes.map((s) => (
            <label key={s} className="flex cursor-pointer items-center justify-between rounded-xl border border-line/15 px-3 py-2.5 text-sm">
              <span>{SCOPE_LABEL[s]}</span>
              <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--accent))]" checked={on.includes(s)} onChange={() => setOn(on.includes(s) ? on.filter((x) => x !== s) : [...on, s])} />
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-3 rounded-xl bg-ink/5 p-3 text-xs sm:grid-cols-2">
          <div><b className="text-accent">Will see</b><br />Your taste picks and archetype in the domains you leave ticked.</div>
          <div><b className="text-accent">Never sees</b><br />Your name, email, location, browsing or listening history.</div>
        </div>
        {err && <p className="mt-3 text-sm text-accent">{err}</p>}
        <div className="mt-5 flex gap-2">
          <button disabled={busy || !on.length} onClick={() => submit()} className="btn-primary flex-1">Approve</button>
          <button disabled={busy} onClick={() => submit(true)} className="btn-ghost">Deny</button>
        </div>
        <p className="mt-3 text-center text-xs text-mute">Revoke anytime in My TasteID → Connected apps.</p>
      </div>
    </div>
  );
}
