import { sessionPassportId } from '@/lib/auth';
import { getClient } from '@/lib/clients';
import { dbGet, dbList, dbPatch } from '@/lib/db';
import { validScopes } from '@/lib/domains';
import { err, json } from '@/lib/http';

export async function GET() {
  const pid = await sessionPassportId();
  if (!pid) return err('login_required', 401);
  const grants = (await dbList('grants', 'passport_id', pid)).filter((g: any) => !g.revoked_at);
  const out = await Promise.all(grants.map(async (g: any) => ({ id: g.id, client_id: g.client_id, name: (await getClient(g.client_id))?.name || g.client_id, scopes: g.scopes, created_at: g.created_at, last_used_at: g.last_used_at })));
  return json({ connections: out });
}
export async function PATCH(req: Request) {
  const pid = await sessionPassportId();
  if (!pid) return err('login_required', 401);
  const { id, scopes } = await req.json();
  const g = await dbGet('grants', id);
  if (!g || g.passport_id !== pid) return err('not_found', 404);
  await dbPatch('grants', id, { scopes: validScopes(scopes || []) });
  return json({ ok: true });
}
export async function DELETE(req: Request) {
  const pid = await sessionPassportId();
  if (!pid) return err('login_required', 401);
  const id = new URL(req.url).searchParams.get('id') || '';
  const g = await dbGet('grants', id);
  if (!g || g.passport_id !== pid) return err('not_found', 404);
  await dbPatch('grants', id, { revoked_at: new Date().toISOString() });
  return json({ ok: true });
}
