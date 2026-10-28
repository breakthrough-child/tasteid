import crypto from 'node:crypto';
import { randomKey, sessionPassportId } from '@/lib/auth';
import { getClient, redirectAllowed } from '@/lib/clients';
import { dbList, dbPatch, dbPut } from '@/lib/db';
import { validScopes } from '@/lib/domains';
import { err, json } from '@/lib/http';

export async function POST(req: Request) {
  const pid = await sessionPassportId();
  if (!pid) return err('login_required', 401);
  const b = await req.json();
  const client = await getClient(b.client_id);
  if (!client) return err('unknown_client');
  if (!redirectAllowed(client, b.redirect_uri)) return err('redirect_uri_not_registered');
  if (!b.code_challenge) return err('code_challenge_required');
  const scopes = validScopes(b.scopes || []);
  const u = new URL(b.redirect_uri);
  if (b.deny || !scopes.length) {
    u.searchParams.set('error', 'access_denied'); if (b.state) u.searchParams.set('state', b.state);
    return json({ redirect: u.toString() });
  }
  const existing = (await dbList('grants', 'passport_id', pid)).find((g: any) => g.client_id === client.id && !g.revoked_at);
  const grantId = existing?.id || crypto.randomUUID();
  if (existing) await dbPatch('grants', grantId, { scopes });
  else await dbPut('grants', { id: grantId, passport_id: pid, client_id: client.id, scopes, created_at: new Date().toISOString() });
  const code = randomKey(24);
  await dbPut('auth_codes', { code, passport_id: pid, client_id: client.id, scopes, redirect_uri: b.redirect_uri, code_challenge: b.code_challenge, expires_at: new Date(Date.now() + 10 * 60000).toISOString() });
  u.searchParams.set('code', code); if (b.state) u.searchParams.set('state', b.state);
  return json({ redirect: u.toString() });
}
