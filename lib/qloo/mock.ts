import type { Ent, InsightOpts } from './types';

const h = (s: string) => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; };
const rnd = (s: string) => (h(s) % 10000) / 10000;
const pick = <T,>(a: T[], s: string) => a[h(s) % a.length];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const title = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const A = ['Velvet', 'Neon', 'Paper', 'Hollow', 'Amber', 'Quiet', 'Lunar', 'Copper', 'Glass', 'Wild', 'Saffron', 'Midnight', 'Cobalt', 'Feral', 'Gilded', 'Static'];
const B: Record<string, string[]> = {
  artist: ['Harbor', 'Parade', 'Orchard', 'Signals', 'Tides', 'Choir', 'Engines', 'Garden'],
  movie: ['Summer', 'Letters', 'Highway', 'Archive', 'Hours', 'Station', 'Orbit', 'Season'],
  tv_show: ['Court', 'Island', 'Files', 'Kitchen', 'Heirs', 'Signal', 'District', 'Club'],
  place: ['Trattoria', 'Cantina', 'Noodle Bar', 'Grill', 'Kitchen', 'Izakaya', 'Bistro', 'Taqueria'],
  brand: ['Supply Co.', 'Atelier', 'Works', 'Outfitters', 'Goods', 'Studio', 'Labs', 'Collective'],
  book: ['Almanac', 'Letters', 'Orchard', 'Atlas', 'Confessions', 'Winter', 'Notebooks', 'Garden'],
  podcast: ['Hour', 'Radio', 'Conversations', 'Dispatch', 'Sessions', 'Roundtable', 'Briefing', 'Club'],
  video_game: ['Frontier', 'Descent', 'Tactics', 'Drift', 'Kingdoms', 'Run', 'Legacy', 'Arcade'],
  destination: ['Bay', 'Coast', 'Highlands', 'Harbor', 'Islands', 'Valley', 'Old Town', 'Springs'],
};
const TAGS = ['indie', 'cinematic', 'cozy', 'late-night', 'experimental', 'nostalgic', 'upbeat', 'moody', 'minimalist', 'artisanal', 'adventurous', 'warm', 'melodic', 'gritty', 'dreamy', 'vintage', 'urban', 'coastal', 'handmade', 'bold', 'quiet', 'eclectic'];

function ent(type: string, name: string, extra: Partial<Ent> = {}): Ent {
  const id = `mock-${type}-${slug(name)}`;
  const tags = [pick(TAGS, id + 'a'), pick(TAGS, id + 'b'), pick(TAGS, id + 'c')].filter((v, i, a) => a.indexOf(v) === i);
  return { id, name, type, popularity: Math.round(rnd(id + 'pop') * 100) / 100, tags, ...extra };
}
export const mockSearch = (query: string, type: string): Ent[] => {
  const q = title(query.trim());
  if (!q) return [];
  const base = B[type] || B.artist;
  return [ent(type, q), ...[0, 1, 2].map((i) => ent(type, `${q} ${base[h(q + type + i) % base.length]}`))];
};
function pool(type: string, seed: string, n: number): Ent[] {
  const base = B[type] || B.artist;
  const out: Ent[] = [];
  for (let i = 0; out.length < n && i < n * 4; i++) {
    const name = `${pick(A, seed + type + i)} ${pick(base, seed + type + 'b' + i)}`;
    if (!out.some((e) => e.name === name)) out.push(ent(type, name));
  }
  return out;
}
export const mockInsights = (o: InsightOpts): Ent[] => {
  const sig = (o.signal || []).slice().sort().join(',');
  const take = o.take ?? 12;
  const seedWords = (o.signal || []).map((s) => s.split('-').slice(2).join(' ')).filter(Boolean);
  let list: Ent[];
  if (o.candidates?.length) list = o.candidates.map((id) => ent(o.type, title(id.replace(/^mock-[a-z_]+-/, '').replace(/-/g, ' ')), { id }));
  else list = pool(o.type, o.city ? sig + o.city : sig, take + 6);
  const pop = (e: Ent) => e.popularity ?? 0;
  list = list.map((e) => ({
    ...e,
    // With no signal affinity is flat (popularity order); with a signal it is personalised.
    affinity: sig ? Math.round((0.35 + 0.6 * rnd(sig + e.id)) * 100) / 100 : undefined,
    why: o.explain && sig ? `Shares ${e.tags?.[0] ?? 'a vibe'} and ${e.tags?.[1] ?? 'mood'} energy with ${title(seedWords[h(sig + e.id) % Math.max(1, seedWords.length)] || 'your picks')}` : undefined,
  }));
  list.sort((a, b) => (sig ? (b.affinity ?? 0) - (a.affinity ?? 0) : pop(b) - pop(a)));
  return list.slice(0, take);
};
export const mockTags = (signal: string[]): string[] => {
  const sig = signal.slice().sort().join(',');
  return [...TAGS].sort((a, b) => rnd(sig + a) - rnd(sig + b)).slice(0, 10);
};
export const mockDemographics = (signal: string[]) => {
  const sig = signal.join(',');
  const ages = ['18-24', '25-29', '30-34', '35-44', '45-54', '55+'];
  return { age: Object.fromEntries(ages.map((a) => [a, Math.round((rnd(sig + a) * 2 - 1) * 100) / 100])), gender: { male: Math.round((rnd(sig + 'm') * 2 - 1) * 100) / 100, female: Math.round((rnd(sig + 'f') * 2 - 1) * 100) / 100 } };
};
