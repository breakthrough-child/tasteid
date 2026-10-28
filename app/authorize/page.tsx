import Link from 'next/link';
import { sessionPassportId } from '@/lib/auth';
import { getClient, redirectAllowed } from '@/lib/clients';
import { validScopes } from '@/lib/domains';
import Consent from '@/components/Consent';

export const dynamic = 'force-dynamic';
type P = Record<string, string | undefined>;
export default async function Authorize({ searchParams }: { searchParams: Promise<P> }) {
  const p = await searchParams;
  const client = p.client_id ? await getClient(p.client_id) : null;
  const bad = !client || !p.redirect_uri || !redirectAllowed(client, p.redirect_uri) || !p.code_challenge || p.code_challenge_method !== 'S256';
  if (bad) return <div className="mx-auto max-w-md px-4 py-20 text-center"><h1 className="font-display text-3xl font-semibold">Invalid request</h1><p className="mt-2 text-mute">This sign-in link is missing or has an unregistered client, redirect URI or PKCE challenge.</p></div>;
  const scopes = validScopes((p.scope || '').split(/[ ,+]+/));
  const pid = await sessionPassportId();
  const here = `/authorize?${new URLSearchParams(p as Record<string, string>)}`;
  if (!pid) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="stamp">Sign in with Taste</div>
        <h1 className="mt-4 font-display text-3xl font-semibold">{client!.name} wants your TasteID.</h1>
        <p className="mt-2 text-mute">You don’t have a TasteID on this device yet. It takes about a minute and needs no name or email.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/create?return_to=${encodeURIComponent(here)}`} className="btn-primary">Create your TasteID</Link>
          <Link href={`/restore`} className="btn-ghost">Restore</Link>
        </div>
      </div>
    );
  }
  return <Consent client={{ id: client!.id, name: client!.name, description: client!.description }} scopes={scopes} req={{ client_id: client!.id, redirect_uri: p.redirect_uri!, state: p.state || '', code_challenge: p.code_challenge! }} />;
}
