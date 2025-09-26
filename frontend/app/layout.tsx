// frontend/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Import your global CSS (Tailwind config)
import { Header } from '@/components/layout/Header'; // Import a header component
import { Footer } from '@/components/layout/Footer'; // Import a footer component
import SmoothScrollProvider from '@/components/SmoothScrollProvider'; // Import smooth scroll provider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KrishiDrishti - Crop Health Analysis',
  description: 'AI-powered monitoring of crop health using hyperspectral and RGB data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SmoothScrollProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}