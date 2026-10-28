import crypto from 'node:crypto';
import { randomKey, setSession, sha256 } from '@/lib/auth';
import { dbPut } from '@/lib/db';
import { err, json } from '@/lib/http';
import { buildProfile, type Seed } from '@/lib/taste/build-profile';

export const maxDuration = 60;
export async function POST(req: Request) {
  const { seeds } = (await req.json()) as { seeds: Seed[] };
  if (!Array.isArray(seeds) || seeds.length < 3 || seeds.length > 10) return err('Pick between 3 and 10 things you love.');
  const clean = seeds.map((s) => ({ id: String(s.id), name: String(s.name).slice(0, 120), type: String(s.type), image: s.image }));
  let profile;
  try { profile = await buildProfile(clean); } catch { return err('Our taste graph is having a moment. Please try again.', 502); }
  const id = crypto.randomUUID();
  const recoveryKey = `tid-${randomKey(18)}`;
  const now = new Date().toISOString();
  await dbPut('passports', { id, secret_hash: sha256(recoveryKey), seeds: clean, profile, created_at: now, updated_at: now });
  await setSession(id);
  return json({ id, recoveryKey });
}
