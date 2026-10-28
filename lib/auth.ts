import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { dbGet, dbPatch } from './db';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me-0123456789abcdef');
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
export const randomKey = (n = 24) => crypto.randomBytes(n).toString('base64url');
export const b64urlSha256 = (s: string) => crypto.createHash('sha256').update(s).digest('base64url');

const COOKIE = 'tid_session';
export async function setSession(passportId: string) {
  const jwt = await new SignJWT({ pid: passportId }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('180d').sign(secret());
  (await cookies()).set(COOKIE, jwt, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 180 });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }
export async function sessionPassportId(): Promise<string | null> {
  const c = (await cookies()).get(COOKIE)?.value;
  if (!c) return null;
  try { return ((await jwtVerify(c, secret())).payload.pid as string) || null; } catch { return null; }
}

export type AccessClaims = { sub: string; gid: string; cid: string; scope: string };
export async function signAccess(c: AccessClaims) {
  return new SignJWT({ gid: c.gid, cid: c.cid, scope: c.scope }).setProtectedHeader({ alg: 'HS256' })
    .setSubject(c.sub).setIssuedAt().setExpirationTime('1h').sign(secret());
}

export type TokenContext = { passportId: string; grantId: string; clientId: string; scopes: string[] };
export async function authBearer(req: Request): Promise<TokenContext | null> {
  const h = req.headers.get('authorization') || '';
  const tok = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!tok) return null;
  try {
    const { payload } = await jwtVerify(tok, secret());
    const grant = await dbGet('grants', payload.gid as string);
    if (!grant || grant.revoked_at) return null;
    const allowed = new Set<string>(grant.scopes);
    const scopes = String(payload.scope || '').split(' ').filter((s) => allowed.has(s));
    dbPatch('grants', grant.id, { last_used_at: new Date().toISOString() }).catch(() => {});
    return { passportId: payload.sub as string, grantId: grant.id, clientId: grant.client_id, scopes };
  } catch { return null; }
}
