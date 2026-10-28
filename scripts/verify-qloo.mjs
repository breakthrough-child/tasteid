// Probes the Qloo API and prints a compact table. Prints only; writes no files (public-repo data rule).
import fs from 'node:fs';
try { for (const l of fs.readFileSync('.env.local', 'utf8').split('\n')) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; } } catch {}
const KEY = process.env.QLOO_API_KEY, BASE = process.env.QLOO_BASE_URL || 'https://hackathon.api.qloo.com';
if (!KEY) { console.log('QLOO_API_KEY not set — skipping probe (mock mode).'); process.exit(0); }
const rows = [];
async function probe(label, path, params) {
  const q = new URLSearchParams(params);
  try {
    const r = await fetch(`${BASE}${path}?${q}`, { headers: { 'X-Api-Key': KEY } });
    let n = '-', s = '';
    if (r.ok) { const j = await r.json(); const res = j.results; const list = Array.isArray(res) ? res : res?.entities || res?.tags || res?.demographics || res?.heatmap || []; n = list.length; s = list[0]?.name || list[0]?.entity_id || ''; }
    rows.push([label, r.status, n, String(s).slice(0, 28)]);
    return r.ok ? r : null;
  } catch (e) { rows.push([label, 'ERR', '-', e.message.slice(0, 28)]); }
}
const types = ['artist', 'movie', 'tv_show', 'place', 'brand', 'book', 'podcast', 'video_game', 'destination', 'person'];
const seed = {};
for (const t of types) {
  const q = { artist: 'Radiohead', movie: 'Inception', tv_show: 'Severance', place: 'Joe\'s Pizza', brand: 'Nike', book: 'Dune', podcast: 'Serial', video_game: 'Zelda', destination: 'Tokyo', person: 'Tom Hanks' }[t];
  const r = await probe(`search ${t}`, '/search', { query: q, types: `urn:entity:${t}` });
  if (r) { const j = await (await fetch(`${BASE}/search?${new URLSearchParams({ query: q, types: `urn:entity:${t}` })}`, { headers: { 'X-Api-Key': KEY } })).json(); seed[t] = (j.results?.[0] || j.results?.entities?.[0])?.entity_id; }
}
const sig = Object.values(seed).filter(Boolean).slice(0, 3).join(',');
for (const t of types) await probe(`insights ${t}`, '/v2/insights', { 'filter.type': `urn:entity:${t}`, 'signal.interests.entities': sig, take: 5, ...(t === 'place' ? { 'filter.location.query': 'New York' } : {}) });
await probe('insights explain', '/v2/insights', { 'filter.type': 'urn:entity:movie', 'signal.interests.entities': sig, 'feature.explainability': 'true', take: 3 });
await probe('urn:tag', '/v2/insights', { 'filter.type': 'urn:tag', 'signal.interests.entities': sig, take: 5 });
await probe('urn:demographics', '/v2/insights', { 'filter.type': 'urn:demographics', 'signal.interests.entities': sig });
await probe('urn:heatmap', '/v2/insights', { 'filter.type': 'urn:heatmap', 'signal.interests.entities': sig, 'filter.location.query': 'New York' });
if (seed.movie) await probe('filter.results.entities', '/v2/insights', { 'filter.type': 'urn:entity:movie', 'signal.interests.entities': sig, 'filter.results.entities': seed.movie, take: 5 });
await probe('/v2/tags', '/v2/tags', { 'filter.query': 'comedy' });
await probe('/v2/trending', '/v2/trending', { 'filter.type': 'urn:entity:movie' });
await probe('/v2/analysis/compare', '/v2/analysis/compare', { 'a.signal.interests.entities': sig, 'b.signal.interests.entities': sig, 'filter.type': 'urn:entity:movie' });
console.log('endpoint'.padEnd(26), 'status'.padEnd(7), 'count'.padEnd(6), 'sample');
for (const r of rows) console.log(String(r[0]).padEnd(26), String(r[1]).padEnd(7), String(r[2]).padEnd(6), r[3]);
console.log('\nUpdate lib/qloo/capabilities.ts for any row that is not 200.');
