import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: "Arc'teryx Stock Monitor",
  description: "Get notified when Arc'teryx products come back in stock!",
};

function Nav() {
  return (
    <nav className="border-b border-neutral-800 bg-neutral-950">
      <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white tracking-tight">
          Arc&apos;teryx Stock Monitor
        </Link>
        <div className="flex gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-neutral-300 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Subscribe
          </Link>
          <Link
            href="/subscriptions"
            className="px-3 py-1.5 text-sm text-neutral-300 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"
          >
            My Subscriptions
          </Link>
          <Link
            href="/popular"
            className="px-3 py-1.5 text-sm text-neutral-300 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Popular Items
          </Link>
          <Link
            href="/tutorial"
            className="px-3 py-1.5 text-sm text-neutral-300 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Tutorial
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen">
        <Nav />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {children}
        </main>
      </body>
    </html>
  );
}
