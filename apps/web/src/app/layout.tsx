import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: 'SportsLink',
  description: 'Book sports venues, fill your match and find players near you.',
};

// Fonts and colours are chosen once the SportsLink brand is set. System fonts until then.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {process.env.DEMO === '1' && (
          <p role="note" className="bg-accent px-4 py-1.5 text-center text-xs font-bold text-on-accent">
            Demo version: use made-up details and never upload a real ID. Sign-in code is 123456.
          </p>
        )}
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
