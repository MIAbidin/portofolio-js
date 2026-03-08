'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Halaman login tidak dibungkus AdminLayout (tidak ada sidebar)
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}