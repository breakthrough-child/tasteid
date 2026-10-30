import { dbGet } from '../db';
import { DOMAINS, DOMAIN_META, type Domain } from '../domains';
import { insights, searchEntities, type Ent } from '../qloo/client';
import { DEFAULT_CITY, domainInsights, type Profile, type Seed } from './build-profile';

export async function loadPassport(id: string) {
  const p = await dbGet('passports', id);
  return p ? { id: p.id as string, seeds: (p.seeds || []) as Seed[], profile: p.profile as Profile | null } : null;
}

const has = (scopes: string[], s: string) => scopes.includes(s);

/** The profile limited to the scopes the user granted. */
export async function scopedTaste(passportId: string, scopes: string[]) {
  const p = await loadPassport(passportId);
  if (!p?.profile) return null;
  const out: Record<string, any> = { scopes };
  if (has(scopes, 'taste:summary')) Object.assign(out, { archetype: p.profile.archetype, taste_dna: p.profile.dna });
  out.domains = {};
  for (const d of DOMAINS) {
    if (!has(scopes, `taste:${d}`)) continue;
    out.domains[d] = { tags: p.profile.domains[d].tags, top: p.profile.domains[d].entities.slice(0, 10).map(slim) };
  }
  return out;
}
const slim = (e: Ent) => ({ id: e.id, name: e.name, type: e.type, affinity: e.affinity, image: e.image });

export type RecInput = { domain: Domain; candidates?: (string | { id: string; type?: string; name?: string })[]; context?: { city?: string }; take?: number };

export async function recommend(passportId: string, scopes: string[], input: RecInput) {
  if (!DOMAINS.includes(input.domain)) return { error: 'unknown_domain', status: 400 };
  if (!has(scopes, `taste:${input.domain}`)) return { error: 'insufficient_scope', required: `taste:${input.domain}`, status: 403 };
  const p = await loadPassport(passportId);
  if (!p) return { error: 'not_found', status: 404 };
  const signal = p.seeds.map((s) => s.id);
  const types = DOMAIN_META[input.domain].types;
  const cands = (input.candidates || []).map((c) => (typeof c === 'string' ? { id: c, type: types[0] } : { id: c.id, type: c.type || types[0], name: c.name }));
  const names = new Map(cands.map((c: any) => [c.id, c.name]));
  let items = await domainInsights(input.domain, signal, { take: input.take ?? (cands.length || 10), city: input.context?.city, candidates: cands as any, explain: true });
  items = items.map((e) => ({ ...e, name: names.get(e.id) && (e.name === e.id || !e.name) ? names.get(e.id)! : e.name }));
  const seedNames = p.seeds.map((s) => s.name);
  const byId = new Map(p.seeds.map((x) => [x.id.toLowerCase(), x.name]));
  const withWhy = items.map((e, i) => ({
    id: e.id, name: e.name, type: e.type, affinity: e.affinity, image: e.image,
    why: (e.because && byId.get(e.because.toLowerCase()) ? `Because you love ${byId.get(e.because.toLowerCase())}${e.tags?.length ? ` — ${e.tags.slice(0, 2).join(' & ')}` : ''}` : e.why) || (e.tags?.length ? `Matches your taste for ${e.tags.slice(0, 2).join(' & ')}${seedNames[i % seedNames.length] ? `, like ${seedNames[i % seedNames.length]}` : ''}` : `Fits the taste you shared (${seedNames[0] ?? 'your picks'})`),
  }));
  return { domain: input.domain, mode: cands.length ? 'rerank' : 'discover', items: withWhy };
}

export async function search(query: string, type: string) {
  return searchEntities(query, type, 5);
}

export async function explain(passportId: string, entityId: string, type?: string) {
  const p = await loadPassport(passportId);
  if (!p) return null;
  const t = type || (entityId.startsWith('mock-') ? entityId.split('-')[1] : 'movie');
  const r = await insights({ type: t, signal: p.seeds.map((s) => s.id), candidates: [entityId], explain: true, take: 1 }).catch(() => []);
  return r[0] ? { id: r[0].id, name: r[0].name, affinity: r[0].affinity, why: (r[0].because && p.seeds.find((x) => x.id.toLowerCase() === r[0].because!.toLowerCase()) ? `Because you love ${p.seeds.find((x) => x.id.toLowerCase() === r[0].because!.toLowerCase())!.name}` : r[0].why) || 'It overlaps with the themes in your seeds.' } : { id: entityId, why: 'No explanation available.' };
}

export { DEFAULT_CITY };
