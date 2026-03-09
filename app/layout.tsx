import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: "Arc'teryx Stock Monitor",
  description: "Get notified when Arc'teryx products come back in stock!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-neutral-100 min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">
          {children}
        </main>
        <footer className="border-t border-neutral-800/40 py-6">
          <p className="text-center text-xs text-neutral-600">
            Arc&apos;teryx Stock Monitor &middot; Checks every 15 minutes
          </p>
        </footer>
      </body>
    </html>
  );
}
