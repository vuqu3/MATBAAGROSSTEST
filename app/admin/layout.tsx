'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const userRole = String(session?.user?.role ?? '').toUpperCase();

  useEffect(() => {
    if (pathname === '/admin/login') return;

    if (status === 'unauthenticated') {
      router.replace('/admin/login');
      return;
    }

    if (status === 'authenticated' && userRole && userRole !== 'ADMIN') {
      if (userRole === 'SELLER') {
        window.location.href = 'https://fabrika.matbaagross.com/seller-dashboard';
        return;
      }
      router.replace('/');
    }
  }, [status, router, pathname, userRole]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (userRole !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <div
        className="transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <AdminHeader
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setSidebarCollapsed((c) => !c)}
          userEmail={session.user?.email ?? null}
          userName={(session.user as { name?: string | null })?.name ?? null}
        />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
