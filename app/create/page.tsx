import Builder from '@/components/Builder';

export default async function Create({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const { return_to } = await searchParams;
  const rt = return_to && return_to.startsWith('/') && !return_to.startsWith('//') ? return_to : undefined;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 max-w-2xl"><div className="stamp">60 seconds</div>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Build your TasteID.</h1>
        <p className="mt-3 text-mute">Name a few things you love. Qloo’s taste graph does the rest — across music, film, dining, brands, books and more. No name, no email.</p></div>
      <Builder returnTo={rt} />
    </div>
  );
}
