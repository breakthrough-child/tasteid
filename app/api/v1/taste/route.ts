import { authBearer } from '@/lib/auth';
import { err, json } from '@/lib/http';
import { scopedTaste } from '@/lib/taste/service';
export { OPTIONS } from '@/lib/http';

export async function GET(req: Request) {
  const ctx = await authBearer(req);
  if (!ctx) return err('invalid_token', 401);
  const t = await scopedTaste(ctx.passportId, ctx.scopes);
  return t ? json(t) : err('not_found', 404);
}
