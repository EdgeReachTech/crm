import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/contexts/AppProviders';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CRM Dashboard',
  description: 'Modern CRM solution for sales and marketing teams',
  keywords: 'CRM, sales, marketing, dashboard, leads, opportunities, contacts',
  authors: [{ name: 'CRM Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="font-sans antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}