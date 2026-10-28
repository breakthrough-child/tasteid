'use client';
import { useState } from 'react';

export default function Restore() {
  const [k, setK] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true); setErr('');
    const r = await fetch('/api/passport/restore', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recoveryKey: k }) });
    if (r.ok) location.href = '/me'; else setErr((await r.json()).error || 'Failed'); setBusy(false);
  }
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl font-semibold">Restore your TasteID</h1>
      <p className="mt-2 text-sm text-mute">Paste the recovery key you saved when you created it.</p>
      <input value={k} onChange={(e) => setK(e.target.value)} placeholder="tid-…" className="mt-4 w-full rounded-2xl border border-line/20 bg-card px-4 py-3 font-mono text-sm outline-none focus:border-accent" />
      {err && <p className="mt-2 text-sm text-accent">{err}</p>}
      <button disabled={busy || !k} onClick={go} className="btn-primary mt-4">Restore</button>
    </div>
  );
}
