'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [vendor, setVendor] = useState<{ id: string; name: string; slug: string; commissionRate: number; balance: number; subscriptionStatus?: string | null; subscriptionEndsAt?: string | null } | null>(null);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const loadMe = useCallback(async (isInitial: boolean) => {
    if (isInitial) setVendorLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/seller/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        setApplicationStatus((data?.applicationStatus ?? null) as string | null);
        if (data?.vendor) setVendor(data.vendor);
        else if (!data?.vendor && data?.applicationStatus) setVendor(null);
      } else if (res.status === 401) {
        setFetchError('Oturum süresi dolmuş. Lütfen yeniden giriş yapın.');
      } else if (res.status === 404) {
        router.push('/');
        return;
      } else {
        setFetchError('Veriler alınamadı. Lütfen sayfayı yenileyin.');
      }
    } catch {
      setFetchError('Bağlantı hatası. Lütfen sayfayı yenileyin.');
    } finally {
      if (isInitial) {
        setVendorLoading(false);
        initialLoadDone.current = true;
      }
    }
  }, [router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/seller-login');
      return;
    }
    if (status !== 'authenticated' || !session?.user?.id) return;

    loadMe(true);

    const onFocus = () => {
      if (initialLoadDone.current) loadMe(false);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && initialLoadDone.current) loadMe(false);
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [status, session?.user?.id, router, loadMe]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!applicationStatus) return;

    const isOnboarding = pathname?.startsWith('/seller-dashboard/onboarding');
    const isApproved = applicationStatus === 'APPROVED';

    if (!isApproved && !isOnboarding) {
      router.replace('/seller-dashboard/onboarding');
      return;
    }

    if (isApproved && isOnboarding) {
      router.replace('/seller-dashboard');
    }
  }, [applicationStatus, pathname, router, status]);

  // Subscription gating disabled — all sellers can access dashboard directly

  if (status === 'loading' || vendorLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="text-center max-w-md p-8">
          <p className="text-red-600 font-semibold mb-4">{fetchError}</p>
          <button
            onClick={() => loadMe(true)}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (applicationStatus && applicationStatus !== 'APPROVED') {
    return <div className="min-h-screen bg-gray-50/50">{children}</div>;
  }

  if (!vendor) {
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
