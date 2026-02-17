'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SellerSidebar from './components/SellerSidebar';
import SellerHeader from './components/SellerHeader';

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vendor, setVendor] = useState<{ id: string; name: string; slug: string; commissionRate: number; balance: number } | null>(null);
  const [vendorLoading, setVendorLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris');
      return;
    }
    if (status !== 'authenticated' || !session?.user?.id) return;

    fetch('/api/seller/me')
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 404) router.push('/');
        return null;
      })
      .then((data) => {
        if (data?.vendor) setVendor(data.vendor);
        setVendorLoading(false);
      })
      .catch(() => setVendorLoading(false));
  }, [status, session, router]);

  if (status === 'loading' || vendorLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!session || !vendor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SellerSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        vendorName={vendor.name}
      />
      <div
        className="transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <SellerHeader
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
