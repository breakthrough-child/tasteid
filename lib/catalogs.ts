import fs from 'node:fs';
import path from 'node:path';
import { searchEntities, type Ent } from './qloo/client';

// Catalogs are plain title lists we wrote ourselves; Qloo entities are resolved at runtime and cached server-side (qloo_cache).
export type CatalogEntry = { title: string; type: string };
export function readTitles(app: string): CatalogEntry[] {
  const f = path.join(process.cwd(), 'data', 'catalogs', `${app}.titles.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
export async function resolveCatalog(app: string): Promise<Ent[]> {
  const titles = readTitles(app);
  const out: (Ent | null)[] = [];
  for (let i = 0; i < titles.length; i += 8) {
    const chunk = titles.slice(i, i + 8);
    out.push(...(await Promise.all(chunk.map(async (t) => {
      try { const r = await searchEntities(t.title, t.type, 1); return r[0] ? { ...r[0], name: t.title, type: t.type } : null; } catch { return null; }
    }))));
  }
  return out.filter(Boolean) as Ent[];
}
