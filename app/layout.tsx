import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Muhammad Irfan Abidin | Full Stack Developer & AI Engineer',
  description: 'Portfolio Muhammad Irfan Abidin (MIA) — Full Stack Developer & AI Engineer Enthusiast. Lihat proyek dan keahlian saya di miabidin.dev',
  keywords: ['Muhammad Irfan Abidin', 'MIA', 'miabidin', 'Full Stack Developer', 'AI Engineer', 'Portfolio'],
  authors: [{ name: 'Muhammad Irfan Abidin', url: 'https://miabidin.dev' }],
  creator: 'Muhammad Irfan Abidin',
  openGraph: {
    title: 'Muhammad Irfan Abidin | Full Stack Developer & AI Engineer',
    description: 'Portfolio Muhammad Irfan Abidin — Full Stack Developer & AI Engineer Enthusiast',
    url: 'https://miabidin.dev',
    siteName: 'miabidin.dev',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary',
    title: 'Muhammad Irfan Abidin | Full Stack Developer',
    description: 'Portfolio Muhammad Irfan Abidin — Full Stack Developer & AI Engineer Enthusiast',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111633',
              color: '#00d9ff',
              border: '1px solid rgba(0,217,255,0.3)',
              fontFamily: 'DM Mono, monospace',
              fontSize: 12,
            },
          }}
        />
      </body>
    </html>
  );
}
