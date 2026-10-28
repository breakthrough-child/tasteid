'use client';
import Script from 'next/script';
import { useState } from 'react';

export default function DevConsole() {
  const [tok, setTok] = useState<any>(null);
  const [out, setOut] = useState('');
  const show = (v: unknown) => setOut(JSON.stringify(v, null, 2));
  const scopes = 'taste:summary taste:music taste:film_tv taste:dining taste:brands';
  return (
    <div className="rounded-2xl border border-line/15 bg-card p-4">
      <Script src="/sdk/tasteid.js" strategy="afterInteractive" onLoad={() => (window as any).TasteID?.scan()} />
      <div ref={(el) => { el?.addEventListener('tasteid:signin', (e: any) => { setTok(e.detail); show({ connected: true, scopes: e.detail.scopes }); }, { once: true }); }}>
        <div data-tasteid-button data-client-id="tasteid-console" data-scopes={scopes} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={!tok} className="btn-ghost" onClick={async () => show(await tok.api.taste())}>GET /api/v1/taste</button>
        <button disabled={!tok} className="btn-ghost" onClick={async () => show(await tok.api.recommend({ domain: 'music', take: 5 }))}>POST /api/v1/recommend (music)</button>
        <button disabled={!tok} className="btn-ghost" onClick={async () => show(await tok.api.recommend({ domain: 'dining', context: { city: 'New York' }, take: 5 }))}>recommend (dining, NYC)</button>
      </div>
      <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-ink/5 p-3 text-xs">{out || 'Sign in, then call an endpoint.'}</pre>
    </div>
  );
}
