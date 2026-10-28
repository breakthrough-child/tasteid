import { setSession, sha256 } from '@/lib/auth';
import { dbList } from '@/lib/db';
import { err, json } from '@/lib/http';

export async function POST(req: Request) {
  const { recoveryKey } = await req.json();
  const rows = await dbList('passports', 'secret_hash', sha256(String(recoveryKey || '').trim()));
  if (!rows[0]) return err('That recovery key was not found.', 404);
  await setSession(rows[0].id);
  return json({ ok: true });
}
