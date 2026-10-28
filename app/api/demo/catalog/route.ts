import { resolveCatalog } from '@/lib/catalogs';
import { insights, isMock } from '@/lib/qloo/client';
import { err, json } from '@/lib/http';

// The demo apps' OWN catalog backend (what a real third-party app would have). Not a taste API.
export const maxDuration = 60;
export async function GET(req: Request) {
  const u = new URL(req.url);
  const app = u.searchParams.get('app');
  try {
    if (app === 'reelhouse' || app === 'threadline') return json({ items: await resolveCatalog(app), mock: isMock() });
    if (app === 'forkful') {
      const city = u.searchParams.get('city') || 'New York';
      const items = await insights({ type: 'place', city, take: 20 });
      return json({ items: items.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)), city, mock: isMock() });
    }
  } catch { return err('catalog_unavailable', 502); }
  return err('unknown_app');
}
