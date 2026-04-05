import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'block',
  preload: true,
  fallback: ['Arial', 'sans-serif'],
  adjustFontFallback: true,
  weight: ['400', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'block',
  preload: true,
  fallback: ['Arial', 'sans-serif'],
  adjustFontFallback: true,
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Sequel - Resilient URL Shortener',
  description: 'FastAPI + Redis + PostgreSQL URL shortener with operations visibility.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .font-heading{font-family:Arial,sans-serif;font-weight:800}
          .font-body{font-family:Arial,sans-serif}
          .bg-sequel-primary{background-color:#ffffff}
          .bg-sequel-light{background-color:#ffffff}
          .bg-sequel-black{background-color:#000}
          .text-sequel-black{color:#000}
          .border-sequel-black{border-color:#000}
          h1{min-height:200px}
          @media(min-width:768px){h1{min-height:280px}}
        `,
          }}
        />
      </head>
      <body className="font-body bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}
