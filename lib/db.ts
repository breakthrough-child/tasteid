import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type Table = 'passports' | 'clients' | 'grants' | 'auth_codes' | 'qloo_cache';
const PK: Record<Table, string> = { passports: 'id', clients: 'id', grants: 'id', auth_codes: 'code', qloo_cache: 'key' };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const usingSupabase = !!(url && key);
const sb = usingSupabase ? createClient(url!, key!, { auth: { persistSession: false } }) : null;

// Local fallback store (dev only) so the app runs before Supabase is configured.
const FILE = process.env.VERCEL ? path.join(os.tmpdir(), 'tasteid-store.json') : path.join(process.cwd(), '.data', 'store.json');
type Store = Record<Table, Record<string, any>>;
function load(): Store {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return { passports: {}, clients: {}, grants: {}, auth_codes: {}, qloo_cache: {} }; }
}
function save(s: Store) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(s));
}

export async function dbGet<T = any>(t: Table, id: string): Promise<T | null> {
  if (sb) {
    const { data } = await sb.from(t).select('*').eq(PK[t], id).maybeSingle();
    return (data as T) ?? null;
  }
  return (load()[t][id] as T) ?? null;
}
export async function dbPut(t: Table, row: Record<string, any>) {
  if (sb) {
    const { error } = await sb.from(t).upsert(row);
    if (error) throw new Error(`db ${t}: ${error.message}`);
    return;
  }
  const s = load();
  s[t][row[PK[t]]] = { ...(s[t][row[PK[t]]] || {}), ...row };
  save(s);
}
export async function dbDel(t: Table, id: string) {
  if (sb) { await sb.from(t).delete().eq(PK[t], id); return; }
  const s = load(); delete s[t][id]; save(s);
}
export async function dbList<T = any>(t: Table, col: string, val: string): Promise<T[]> {
  if (sb) {
    const { data } = await sb.from(t).select('*').eq(col, val);
    return (data as T[]) ?? [];
  }
  return Object.values(load()[t]).filter((r: any) => r[col] === val) as T[];
}
export async function dbPatch(t: Table, id: string, patch: Record<string, any>) {
  if (sb) {
    const { error } = await sb.from(t).update(patch).eq(PK[t], id);
    if (error) throw new Error(`db ${t}: ${error.message}`);
    return;
  }
  const s = load();
  if (s[t][id]) { s[t][id] = { ...s[t][id], ...patch }; save(s); }
}
