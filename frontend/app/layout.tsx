// frontend/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Import your global CSS (Tailwind config)
import { Header } from '@/components/layout/Header'; // Import a header component
import { Footer } from '@/components/layout/Footer'; // Import a footer component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KrishiDrishti - Crop Health Analysis',
  description: 'AI-powered monitoring of crop health using RGB images.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}