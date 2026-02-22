'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  useEffect(() => {
    const target = callbackUrl
      ? `/giris?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/giris';
    router.replace(target);
  }, [callbackUrl, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Yönlendiriliyor...</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-gray-400 text-sm">Yükleniyor...</div>
        </div>
      }
    >
      <LoginRedirectInner />
    </Suspense>
  );
}
