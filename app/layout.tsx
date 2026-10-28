import type { Metadata } from 'next';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'TasteID — Sign in with Taste',
  description: 'A portable, user-owned taste profile. Every app starts from zero; TasteID makes your taste travel with you.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="mx-auto mt-24 max-w-6xl px-4 pb-10 text-xs text-mute">
          TasteID · MIT licensed · Built for the Qloo Agentic Hackathon · No names, no emails, no history — ever.
        </footer>
      </body>
    </html>
  );
}
