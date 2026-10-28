'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="stamp">Error</div>
      <h1 className="mt-4 font-display text-3xl font-semibold">Something went sideways.</h1>
      <p className="mt-2 text-mute">Our taste graph or database hiccuped. Your TasteID is safe — try again.</p>
      <button onClick={reset} className="btn-primary mt-6">Try again</button>
    </div>
  );
}
