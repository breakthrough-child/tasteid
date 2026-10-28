import { ENTITY_TYPES } from '@/lib/domains';
import { searchEntities } from '@/lib/qloo/client';
import { json } from '@/lib/http';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = (u.searchParams.get('q') || '').trim();
  const type = u.searchParams.get('type');
  if (q.length < 2) return json({ results: [] });
  const types = type && (ENTITY_TYPES as readonly string[]).includes(type) ? [type] : [...ENTITY_TYPES];
  const settled = await Promise.allSettled(types.map((t) => searchEntities(q, t, type ? 8 : 3)));
  const results = settled.flatMap((s) => (s.status === 'fulfilled' ? s.value : []));
  const failed = settled.every((s) => s.status === 'rejected');
  return json({ results, degraded: failed });
}
