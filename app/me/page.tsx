import Link from 'next/link';
import { sessionPassportId } from '@/lib/auth';
import { DOMAINS, DOMAIN_META } from '@/lib/domains';
import { loadPassport } from '@/lib/taste/service';
import TasteCard from '@/components/TasteCard';
import LogoutButton from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';
export default async function Me() {
  const pid = await sessionPassportId();
  const p = pid ? await loadPassport(pid) : null;
  if (!p?.profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-semibold">No TasteID on this device.</h1>
        <p className="mt-3 text-mute">Create one in about a minute, or restore it with your recovery key.</p>
        <div className="mt-6 flex justify-center gap-3"><Link href="/create" className="btn-primary">Create your TasteID</Link><Link href="/restore" className="btn-ghost">Restore</Link></div>
      </div>
    );
  }
  const { profile } = p;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div>
          <TasteCard id={p.id} profile={profile} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/me/connections" className="btn-primary">Connected apps</Link>
            <Link href="/me/edit" className="btn-ghost">Edit seeds</Link>
            <LogoutButton />
          </div>
          <p className="mt-4 text-xs text-mute">Seeds: {p.seeds.map((s) => s.name).join(' · ')}</p>
        </div>
        <div>
          {profile.highlights.length > 0 && (
            <div className="rounded-2xl border border-accent/40 bg-accent/5 p-4">
              <div className="font-mono text-[11px] uppercase tracking-widest text-accent">Cross-domain discoveries</div>
              {profile.highlights.map((h) => <p key={h} className="mt-1 text-sm">{h}</p>)}
            </div>
          )}
          <div className="mt-6 space-y-6">
            {DOMAINS.map((d) => {
              const dp = profile.domains[d];
              return (
                <section key={d}>
                  <h3 className="flex items-center gap-2 font-display text-xl font-semibold"><span className="stamp">{DOMAIN_META[d].stamp}</span>{DOMAIN_META[d].label}</h3>
                  {dp.entities.length === 0 ? <p className="mt-2 text-sm text-mute">No data for this domain yet.</p> : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {dp.entities.slice(0, 8).map((e) => <span key={e.id} className="chip bg-card">{e.name}</span>)}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
