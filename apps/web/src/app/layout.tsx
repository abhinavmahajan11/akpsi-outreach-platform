import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { OrgsProvider } from '@/context/OrgsContext';
import { CalendarProvider } from '@/context/CalendarContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AKPsi Outreach Platform',
  description:
    'Centralized outreach management for Alpha Kappa Psi — track organizations, contacts, and relationship history across committees.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full antialiased">
        {/*
         * AuthProvider must wrap OrgsProvider so OrgsContext can access
         * the current user when writing ownership fields to the database.
         */}
        <AuthProvider>
          <OrgsProvider>
            <CalendarProvider>{children}</CalendarProvider>
          </OrgsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
