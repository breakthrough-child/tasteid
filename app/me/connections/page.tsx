import Connections from '@/components/Connections';
export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold">Connected apps</h1>
      <p className="mb-6 mt-2 text-mute">Every app that can see your taste. Untick a domain to stop sharing it, or revoke an app entirely — its tokens stop working instantly.</p>
      <Connections />
    </div>
  );
}
