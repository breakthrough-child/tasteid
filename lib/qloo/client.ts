import crypto from 'node:crypto';
import { dbGet, dbPut } from '../db';
import { CAPS } from './capabilities';
import { mockDemographics, mockInsights, mockSearch, mockTags } from './mock';
import type { Ent, InsightOpts } from './types';

export type { Ent, InsightOpts };
export const isMock = () => process.env.QLOO_MOCK === 'true' || !process.env.QLOO_API_KEY;
const BASE = () => (process.env.QLOO_BASE_URL || 'https://hackathon.api.qloo.com').replace(/\/$/, '');
const TTL_MS = 24 * 3600 * 1000;

// Qloo silently ignores unsupported params; only ever send these per filter.type.
const COMMON = ['filter.type', 'take'];
const ALLOW: Record<string, string[]> = {
  entity: [...COMMON, 'feature.explainability', 'signal.interests.entities', 'signal.demographics.age', 'signal.location.query',
    'filter.location.query', 'filter.results.entities', 'filter.exclude.entities', 'filter.popularity.min', 'filter.popularity.max'],
  'urn:tag': [...COMMON, 'signal.interests.entities'],
  'urn:demographics': ['filter.type', 'signal.interests.entities'],
  'urn:heatmap': ['filter.type', 'signal.interests.entities', 'filter.location.query'],
};
function clean(path: string, params: Record<string, string | undefined>) {
  const ft = params['filter.type'] || '';
  const allow = path.startsWith('/v2/insights') ? ALLOW[ft] || ALLOW.entity : null;
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '') continue;
    if (allow && !allow.includes(k)) continue;
    q.set(k, v);
  }
  q.sort();
  return q;
}

export class QlooError extends Error { constructor(public status: number, msg: string) { super(msg); } }

async function call(path: string, params: Record<string, string | undefined>): Promise<any> {
  const q = clean(path, params);
  const cacheKey = crypto.createHash('sha1').update(path + '?' + q.toString()).digest('hex');
  const hit = await dbGet('qloo_cache', cacheKey).catch(() => null);
  if (hit && new Date(hit.expires_at).getTime() > Date.now()) return hit.body;
  let lastErr: any;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${BASE()}${path}?${q}`, { headers: { 'X-Api-Key': process.env.QLOO_API_KEY || '' }, cache: 'no-store' });
    if (res.status === 429) { await new Promise((r) => setTimeout(r, 400 * 2 ** attempt)); lastErr = new QlooError(429, 'rate limited'); continue; }
    if (!res.ok) throw new QlooError(res.status, `Qloo ${path} → ${res.status}`);
    const body = await res.json();
    await dbPut('qloo_cache', { key: cacheKey, body, expires_at: new Date(Date.now() + TTL_MS).toISOString() }).catch(() => {});
    return body;
  }
  throw lastErr;
}

const SHORT = (t: string) => (t || '').replace('urn:entity:', '');
function norm(e: any, fallbackType: string): Ent {
  const tags = Array.isArray(e.tags) ? e.tags.map((t: any) => (typeof t === 'string' ? t : t.name)).filter(Boolean).slice(0, 6) : undefined;
  const type = SHORT(e.type || (Array.isArray(e.types) ? e.types[0] : '') || fallbackType) || fallbackType;
  const img = e.properties?.image?.url || e.image?.url || (typeof e.image === 'string' ? e.image : undefined);
  const why = e.query?.explainability ? summarizeWhy(e.query.explainability) : undefined;
  return {
    id: e.entity_id || e.id, name: e.name, type,
    affinity: typeof e.query?.affinity === 'number' ? e.query.affinity : undefined,
    popularity: typeof e.popularity === 'number' ? e.popularity : undefined,
    image: img, tags, why,
  };
}
function summarizeWhy(x: any): string | undefined {
  try {
    const items = Array.isArray(x) ? x : Object.values(x).flat();
    const names = items.map((i: any) => i?.name || i?.entity?.name || i?.tag?.name).filter(Boolean).slice(0, 2);
    return names.length ? `Connects to ${names.join(' and ')} in your taste` : undefined;
  } catch { return undefined; }
}
const urn = (t: string) => `urn:entity:${t}`;

export async function searchEntities(query: string, type: string, take = 5): Promise<Ent[]> {
  if (isMock()) return mockSearch(query, type).slice(0, take);
  const body = await call('/search', { query, types: urn(type), take: String(take) });
  const list: any[] = body.results?.entities || body.results || body.entities || [];
  return list.slice(0, take).map((e) => norm(e, type));
}

export async function insights(o: InsightOpts): Promise<Ent[]> {
  if (isMock()) return mockInsights(o);
  if (o.candidates?.length && !CAPS.resultsFilter) return o.candidates.map((id) => ({ id, name: id, type: o.type }));
  const body = await call('/v2/insights', {
    'filter.type': urn(o.type),
    'signal.interests.entities': o.signal?.join(','),
    'filter.location.query': o.city,
    'filter.results.entities': o.candidates?.join(','),
    'filter.exclude.entities': o.exclude?.join(','),
    'filter.popularity.min': o.popularity?.min?.toString(),
    'filter.popularity.max': o.popularity?.max?.toString(),
    'feature.explainability': o.explain && CAPS.explainability ? 'true' : undefined,
    take: String(Math.min(o.take ?? 12, 50)),
  });
  const list: any[] = body.results?.entities || [];
  return list.map((e) => norm(e, o.type));
}

export async function topTags(signal: string[], take = 12): Promise<string[]> {
  if (isMock()) return mockTags(signal).slice(0, take);
  if (!CAPS.tags) return [];
  try {
    const body = await call('/v2/insights', { 'filter.type': 'urn:tag', 'signal.interests.entities': signal.join(','), take: String(take) });
    return (body.results?.tags || body.results?.entities || []).map((t: any) => t.name).filter(Boolean).slice(0, take);
  } catch { return []; }
}

export async function demographics(signal: string[]) {
  if (isMock()) return mockDemographics(signal);
  if (!CAPS.demographics) return undefined;
  try {
    const body = await call('/v2/insights', { 'filter.type': 'urn:demographics', 'signal.interests.entities': signal.join(',') });
    const d = body.results?.demographics?.[0]?.query || body.results?.demographics?.[0];
    return d ? { age: d.age, gender: d.gender } : undefined;
  } catch { return undefined; }
}
