import crypto from 'node:crypto';
import { b64urlSha256, signAccess } from '@/lib/auth';
import { dbDel, dbGet, dbList } from '@/lib/db';
import { err, json } from '@/lib/http';
export { OPTIONS } from '@/lib/http';

export async function POST(req: Request) {
  const ct = req.headers.get('content-type') || '';
  const b: Record<string, string> = ct.includes('json') ? await req.json() : Object.fromEntries(new URLSearchParams(await req.text()));
  if (b.grant_type !== 'authorization_code') return err('unsupported_grant_type');
  const row = await dbGet('auth_codes', b.code || '');
  if (!row) return err('invalid_grant');
  await dbDel('auth_codes', row.code); // single use
  if (new Date(row.expires_at).getTime() < Date.now()) return err('invalid_grant');
  if (row.client_id !== b.client_id || row.redirect_uri !== b.redirect_uri) return err('invalid_grant');
  const a = Buffer.from(b64urlSha256(b.code_verifier || '')), c = Buffer.from(row.code_challenge);
  if (a.length !== c.length || !crypto.timingSafeEqual(a, c)) return err('invalid_grant', 400, { error_description: 'PKCE verification failed' });
  const grant = (await dbList('grants', 'passport_id', row.passport_id)).find((g: any) => g.client_id === row.client_id && !g.revoked_at);
  if (!grant) return err('invalid_grant');
  const access_token = await signAccess({ sub: row.passport_id, gid: grant.id, cid: row.client_id, scope: grant.scopes.join(' ') });
  return json({ access_token, token_type: 'Bearer', expires_in: 3600, scope: grant.scopes.join(' ') });
}
