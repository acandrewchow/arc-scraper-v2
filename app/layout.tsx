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
      <body className="bg-neutral-950 text-neutral-100 min-h-screen">
        <Nav />
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
          {children}
        </main>
      </body>
    </html>
  );
}
