'use client';
export default function ThemeToggle() {
  const toggle = () => {
    const el = document.documentElement;
    const dark = el.dataset.theme ? el.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    el.dataset.theme = dark ? 'light' : 'dark';
  };
  return <button onClick={toggle} aria-label="Toggle theme" className="rounded-full px-2.5 py-1.5 text-sm hover:bg-ink/5">◐</button>;
}
