import Link from 'next/link';
export default function NotFound() {
  return <div className="mx-auto max-w-md px-4 py-24 text-center"><div className="stamp">404</div><h1 className="mt-4 font-display text-3xl font-semibold">No stamp for this page.</h1><Link href="/" className="btn-primary mt-6">Back home</Link></div>;
}
