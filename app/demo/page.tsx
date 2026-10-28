import Link from 'next/link';

const APPS = [
  { href: '/demo/reelhouse', name: 'Reelhouse', c: '#e11d48', d: 'Streaming. Scope: film & TV.' },
  { href: '/demo/forkful', name: 'Forkful', c: '#16a34a', d: 'Restaurants by city. Scope: dining.' },
  { href: '/demo/threadline', name: 'Threadline', c: '#2563eb', d: 'Shopping. Scope: brands.' },
];
export default function Demo() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="stamp">Fictional apps</div>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Three apps. One TasteID.</h1>
      <p className="mt-3 max-w-xl text-mute">Each demo integrates only through the public SDK and API, like any third party. Open one, tap Sign in with Taste, and watch cold start disappear.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {APPS.map((a) => (
          <Link key={a.href} href={a.href} className="group rounded-3xl p-6 text-white transition hover:-translate-y-1" style={{ background: a.c }}>
            <div className="font-display text-3xl font-bold">{a.name}</div><p className="mt-2 text-sm opacity-90">{a.d}</p><div className="mt-8 text-sm font-semibold">Open →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
