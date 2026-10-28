'use client';
import { useEffect, useState } from 'react';
import { DOMAINS, SCOPES, SCOPE_LABEL } from '@/lib/domains';

type Conn = { id: string; client_id: string; name: string; scopes: string[]; created_at: string; last_used_at?: string };
export default function Connections() {
  const [list, setList] = useState<Conn[] | null>(null);
  const [err, setErr] = useState('');
  const load = () => fetch('/api/connections').then(async (r) => { if (r.status === 401) { setErr('login'); return; } setList((await r.json()).connections); }).catch(() => setErr('fail'));
  useEffect(() => { load(); }, []);
  async function toggle(c: Conn, s: string) {
    const scopes = c.scopes.includes(s) ? c.scopes.filter((x) => x !== s) : [...c.scopes, s];
    setList(list!.map((x) => (x.id === c.id ? { ...x, scopes } : x)));
    await fetch('/api/connections', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: c.id, scopes }) });
  }
  async function revoke(c: Conn) {
    await fetch(`/api/connections?id=${c.id}`, { method: 'DELETE' });
    setList(list!.filter((x) => x.id !== c.id));
  }
  if (err === 'login') return <p className="text-mute">Create or restore a TasteID to see connections.</p>;
  if (err) return <p className="text-accent">Couldn’t load connections. Refresh to retry.</p>;
  if (!list) return <div className="skeleton h-24 w-full" />;
  if (!list.length) return <div className="rounded-2xl border border-dashed border-line/25 p-8 text-center text-mute">No apps have access to your TasteID yet. Try a <a className="text-accent underline" href="/demo">demo app</a>.</div>;
  return (
    <div className="space-y-4">
      {list.map((c) => (
        <div key={c.id} className="rounded-2xl border border-line/15 bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="font-display text-xl font-semibold">{c.name}</div>
            <span className="text-xs text-mute">Connected {new Date(c.created_at).toLocaleDateString()} · Last used {c.last_used_at ? new Date(c.last_used_at).toLocaleString() : 'never'}</span>
            <button onClick={() => revoke(c)} className="btn-ghost ml-auto !border-accent !text-accent">Revoke access</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SCOPES.map((s) => (
              <button key={s} onClick={() => toggle(c, s)} className={`chip ${c.scopes.includes(s) ? 'border-accent bg-accent/10 text-accent' : 'text-mute line-through'}`}>{SCOPE_LABEL[s]}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
