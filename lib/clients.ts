import { dbGet } from './db';

export type Client = { id: string; name: string; description: string; redirect_uris: string[]; is_demo?: boolean };
export const APP_URL = () => (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

const DEMO: Omit<Client, 'redirect_uris'>[] = [
  { id: 'reelhouse', name: 'Reelhouse', description: 'Demo streaming app built to show TasteID integration', is_demo: true },
  { id: 'forkful', name: 'Forkful', description: 'Demo dining app built to show TasteID integration', is_demo: true },
  { id: 'threadline', name: 'Threadline', description: 'Demo shopping app built to show TasteID integration', is_demo: true },
  { id: 'tasteid-console', name: 'TasteID Console', description: 'Developer try-it console', is_demo: true },
];

export async function getClient(id: string): Promise<Client | null> {
  const d = DEMO.find((c) => c.id === id);
  if (d) return { ...d, redirect_uris: [`${APP_URL()}/sdk/callback.html`] };
  const row = await dbGet('clients', id);
  return row ? { id: row.id, name: row.name, description: row.description, redirect_uris: row.redirect_uris || [] } : null;
}

export function redirectAllowed(c: Client, uri: string) {
  if (c.redirect_uris.includes(uri)) return true;
  // Public demo clients accept /sdk/callback.html on whichever TasteID origin served the SDK (popup flow).
  try {
    const u = new URL(uri);
    return !!c.is_demo && u.pathname === '/sdk/callback.html'; // codes are useless without the PKCE verifier
  } catch { return false; }
}
