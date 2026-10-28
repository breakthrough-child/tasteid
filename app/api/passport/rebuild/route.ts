import { sessionPassportId } from '@/lib/auth';
import { dbPatch } from '@/lib/db';
import { err, json } from '@/lib/http';
import { buildProfile, type Seed } from '@/lib/taste/build-profile';

export const maxDuration = 60;
export async function POST(req: Request) {
  const pid = await sessionPassportId();
  if (!pid) return err('No TasteID on this device.', 401);
  const { seeds } = (await req.json()) as { seeds: Seed[] };
  if (!Array.isArray(seeds) || seeds.length < 3 || seeds.length > 10) return err('Pick between 3 and 10 things you love.');
  try {
    const profile = await buildProfile(seeds);
    await dbPatch('passports', pid, { seeds, profile, updated_at: new Date().toISOString() });
    return json({ ok: true });
  } catch { return err('Our taste graph is having a moment. Please try again.', 502); }
}
