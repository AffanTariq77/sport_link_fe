import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SportsLink Admin',
  description: 'SportsLink admin panel',
};

// Fonts and colours are chosen once the SportsLink brand is set. System fonts until then.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
