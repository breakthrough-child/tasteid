import { authBearer } from '@/lib/auth';
import { err, json } from '@/lib/http';
import { recommend } from '@/lib/taste/service';
export { OPTIONS } from '@/lib/http';
export const maxDuration = 30;

export async function POST(req: Request) {
  const ctx = await authBearer(req);
  if (!ctx) return err('invalid_token', 401);
  const body = await req.json().catch(() => ({}));
  const r: any = await recommend(ctx.passportId, ctx.scopes, body);
  return r.error ? err(r.error, r.status, r.required ? { required: r.required } : {}) : json(r);
}
