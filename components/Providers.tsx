'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import LayoutShell from '@/components/LayoutShell';
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we're on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <SessionProvider>
      <ThemeProvider>
        {/* Admin routes: render without LayoutShell (they have their own AdminLayout) */}
        {/* Public routes: use LayoutShell (Navbar + Footer) */}
        {isAdminRoute ? children : <LayoutShell>{children}</LayoutShell>}
      </ThemeProvider>
    </SessionProvider>
  );
}