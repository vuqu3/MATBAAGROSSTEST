'use client';

import { useState, Suspense } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, AlertCircle } from 'lucide-react';

function SellerLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/seller-dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const waitForSessionRole = async () => {
    for (let i = 0; i < 10; i++) {
      const session = await getSession();
      const role = String(session?.user?.role || '').toUpperCase();
      if (role) return { session, role };
      await new Promise((r) => setTimeout(r, 120));
    }
    const session = await getSession();
    const role = String(session?.user?.role || '').toUpperCase();
    return { session, role };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('E-posta veya şifre hatalı.');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        const { role } = await waitForSessionRole();

        if (role === 'ADMIN') {
          window.location.href = 'https://www.matbaagross.com/admin';
          router.refresh();
          return;
        }

        if (role === 'SELLER') {
          try {
            const res = await fetch('/api/seller/me', { cache: 'no-store' });
            const data = await res.json().catch(() => ({} as any));
            if (!res.ok) {
              setError(typeof (data as any)?.error === 'string' ? (data as any).error : 'Giriş doğrulanamadı.');
              setLoading(false);
              return;
            }

            const applicationStatus = String((data as any)?.applicationStatus || '');
            const hasVendor = Boolean((data as any)?.vendor);

            if (!hasVendor && applicationStatus && applicationStatus !== 'APPROVED') {
              window.location.href = 'https://fabrika.matbaagross.com/seller-dashboard/onboarding';
              return;
            }

            if (!hasVendor) {
              setError('Bu hesap satıcı paneline yetkili değil.');
              setLoading(false);
              return;
            }

            const safeCallback = String(callbackUrl || '').startsWith('/seller-dashboard') ? callbackUrl : '/seller-dashboard';
            window.location.href = `https://fabrika.matbaagross.com${safeCallback}`;
            return;
          } catch {
            setError('Giriş doğrulanamadı. Lütfen tekrar deneyin.');
            setLoading(false);
            return;
          }
        }

        setError('Bu hesap satıcı paneline yetkili değil.');
        setLoading(false);
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f]">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#05070f] via-[#0b1f3a] to-[#111827]" />
          <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-[#FF6000]/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-[520px] w-[520px] rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]" />

          <div className="relative h-full p-12 flex flex-col justify-between">
            <div className="max-w-md">
              <h1 className="text-4xl font-black tracking-tight text-white">
                Türkiye&apos;nin En Büyük Üretim Ağına Hoş Geldiniz.
              </h1>
              <p className="mt-4 text-white/80 leading-relaxed">Yüzlerce talebi karşılayın, üretimi durdurmayın.</p>
              <div className="mt-6 text-sm text-white/70">
                Premium üretici vitrininiz:{' '}
                <span className="font-extrabold text-white/85">fabrika.matbaagross.com/markaniz</span>
              </div>
            </div>

            <div className="text-xs text-white/40">© {new Date().getFullYear()} Matbaagross</div>
          </div>
        </div>

        <div className="bg-white flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link href="https://fabrika.matbaagross.com" className="inline-flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="Matbaagross"
                  width={420}
                  height={120}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-gray-900">Fabrika Paneline Giriş Yap</h2>
            <p className="mt-2 text-sm text-gray-600">Premium üretici paneli için giriş yapın.</p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="seller-email" className="block text-sm font-extrabold text-gray-800 mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="seller-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-4 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                    placeholder="ornek@sirket.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="seller-password" className="block text-sm font-extrabold text-gray-800">
                    Şifre
                  </label>
                  <Link href="/sifremi-unuttum" className="text-xs font-extrabold text-gray-600 hover:text-gray-900">
                    Şifremi Unuttum
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="seller-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-4 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#FF6000] py-4 text-white font-extrabold hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Giriş yapılıyor...' : 'Satıcı Paneline Gir'}
              </button>
            </form>

            <p className="mt-6 text-xs text-gray-600">
              Henüz premium üretici değil misiniz?{' '}
              <Link href="/tedarikci-ol" className="font-extrabold text-gray-900 hover:underline">
                Başvuru yapın.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-gray-400 text-sm">Yükleniyor...</div>
        </div>
      }
    >
      <SellerLoginInner />
    </Suspense>
  );
}
