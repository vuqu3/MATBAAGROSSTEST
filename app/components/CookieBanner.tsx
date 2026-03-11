'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'matbaagross_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-4xl animate-[slideUp_0.4s_ease-out]">
        <div className="relative bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/70 dark:border-white/10 shadow-2xl rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="hidden sm:flex shrink-0 h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15">
            <Cookie className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Text */}
          <p className="flex-1 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            Daha iyi bir kullanıcı deneyimi sunabilmek için çerezleri kullanıyoruz. Sitemizde kalarak{' '}
            <Link
              href="/cerez-politikasi"
              className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
            >
              çerez politikamızı
            </Link>{' '}
            kabul etmiş sayılırsınız.
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              href="/cerez-politikasi"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 rounded-xl transition-colors border border-gray-200/60 dark:border-white/10"
            >
              Daha Fazla Bilgi
            </Link>
            <button
              onClick={accept}
              className="flex-1 sm:flex-none text-center px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
            >
              Anladım, Kabul Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
