'use client';

import { useTheme } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

// Halaman yang TIDAK perlu Footer (opsional, bisa dikosongkan)
const NO_FOOTER_PATHS: string[] = [];

// Halaman yang render Navbar & Footer sendiri (homepage punya layout sendiri)
// Jika homepage sudah direfactor untuk tidak punya navbar/footer embedded,
// hapus entry '/' dari list ini
const SELF_CONTAINED_PATHS: string[] = [];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isLight, toggleTheme, gameUnlocked } = useTheme();
  const pathname = usePathname();

  const isSelfContained = SELF_CONTAINED_PATHS.includes(pathname);
  const showFooter = !NO_FOOTER_PATHS.includes(pathname);

  // Jika halaman self-contained (homepage), cukup render children saja
  // karena homepage sudah punya Navbar & Footer embed di dalamnya
  if (isSelfContained) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar isLight={isLight} toggleTheme={toggleTheme} gameUnlocked={gameUnlocked} />
      <main style={{ paddingTop: 64 /* tinggi navbar */ }}>
        {children}
      </main>
      {showFooter && (
        <Footer isLight={isLight} />
      )}
    </>
  );
}