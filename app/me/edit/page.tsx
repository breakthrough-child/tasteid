import { redirect } from 'next/navigation';
import Builder from '@/components/Builder';
import { sessionPassportId } from '@/lib/auth';
import { loadPassport } from '@/lib/taste/service';

export const dynamic = 'force-dynamic';
export default async function Edit() {
  const pid = await sessionPassportId();
  const p = pid ? await loadPassport(pid) : null;
  if (!p) redirect('/create');
  return <div className="mx-auto max-w-6xl px-4 py-10"><h1 className="mb-6 font-display text-4xl font-semibold">Edit your seeds</h1><Builder mode="rebuild" initial={p.seeds} /></div>;
}
