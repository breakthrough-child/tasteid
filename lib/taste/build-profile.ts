import { demographics, insights, isMock, topTags, type Ent } from '../qloo/client';
import { DOMAINS, DOMAIN_META, domainOfType, type Domain } from '../domains';
import { makeArchetype } from './archetype';

export type Seed = { id: string; name: string; type: string; image?: string };
export type DomainProfile = { entities: Ent[]; tags: string[] };
export type Profile = {
  archetype: { label: string; blurb: string };
  dna: string[];
  domains: Record<Domain, DomainProfile>;
  highlights: string[];
  demographics?: any;
  mock: boolean;
  builtAt: string;
};

export const DEFAULT_CITY = 'New York';

export async function domainInsights(domain: Domain, signal: string[], opts: { take?: number; city?: string; candidates?: Ent[] | string[]; explain?: boolean } = {}): Promise<Ent[]> {
  const types = DOMAIN_META[domain].types;
  const cands = (opts.candidates || []).map((c) => (typeof c === 'string' ? { id: c, type: types[0] } : c));
  const results = await Promise.all(types.map(async (type) => {
    const ids = cands.length ? cands.filter((c) => (c.type || types[0]) === type).map((c) => c.id) : undefined;
    if (cands.length && !ids!.length) return [];
    try {
      return await insights({ type, signal, take: opts.take ?? 12, city: type === 'place' ? opts.city || DEFAULT_CITY : undefined, candidates: ids, explain: opts.explain });
    } catch { return []; }
  }));
  return results.flat().sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0)).slice(0, opts.take ?? 12);
}

export async function buildProfile(seeds: Seed[]): Promise<Profile> {
  const signal = seeds.map((s) => s.id);
  const [perDomain, dna, demo] = await Promise.all([
    Promise.all(DOMAINS.map((d) => domainInsights(d, signal, { take: 12 }))),
    topTags(signal, 12),
    demographics(signal),
  ]);
  const domains = {} as Record<Domain, DomainProfile>;
  DOMAINS.forEach((d, i) => {
    const entities = perDomain[i];
    const count: Record<string, number> = {};
    entities.forEach((e) => e.tags?.forEach((t) => (count[t] = (count[t] || 0) + 1)));
    domains[d] = { entities, tags: Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t) };
  });
  const seedDomains = new Set(seeds.map((s) => domainOfType(s.type)));
  const lead = ([...seedDomains][0] || 'music') as Domain;
  const tags = dna.length ? dna : Object.values(domains).flatMap((d) => d.tags).slice(0, 10);
  const archetype = await makeArchetype(tags, lead, seeds.map((s) => s.name));
  const known = [...seedDomains].map((d) => DOMAIN_META[d].label.toLowerCase());
  const found = DOMAINS.filter((d) => !seedDomains.has(d) && domains[d].entities.length).map((d) => DOMAIN_META[d].label.toLowerCase());
  const highlights = found.length
    ? [`You told us about ${known.join(', ')}; we found your ${found.slice(0, 4).join(', ')} taste.`,
       ...DOMAINS.filter((d) => !seedDomains.has(d) && domains[d].entities.length).slice(0, 3).map((d) => `${DOMAIN_META[d].label}: ${domains[d].entities[0].name} looks like a fit.`)]
    : [];
  return { archetype, dna: tags, domains, highlights, demographics: demo, mock: isMock(), builtAt: new Date().toISOString() };
}
