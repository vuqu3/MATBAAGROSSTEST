'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
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
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-[480px]">
        <div className="bg-white shadow-md border border-gray-200 px-8 py-8 rounded-lg">
          {/* Logo */}
          <Link href="/" className="flex mb-4">
            <Image
              src="/matbaagross-logo.png"
              alt="MatbaaGross"
              width={140}
              height={38}
              className="h-7 w-auto object-contain"
            />
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Satıcı Girişi
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            MatbaaGross Satıcı Paneli
          </p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-700 flex items-center gap-2 text-sm rounded-lg">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="seller-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="seller-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent text-gray-800 placeholder-gray-400 text-sm bg-gray-50"
                  placeholder="ornek@sirket.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="seller-password" className="block text-sm font-medium text-gray-700">
                  Şifre
                </label>
                <Link href="/sifremi-unuttum" className="text-xs text-[#1e3a8a] hover:text-[#1e40af] font-medium">
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="seller-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent text-gray-800 placeholder-gray-400 text-sm bg-gray-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base mt-1"
            >
              {loading ? 'Giriş yapılıyor...' : 'Satıcı Girişi'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Müşteri girişi için{' '}
              <Link href="/giris" className="font-semibold text-[#FF6000] hover:text-[#e55a00]">
                buraya tıklayın
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              Satıcı hesabınız yok mu?{' '}
              <Link href="/tedarikci-ol" className="font-semibold text-[#1e3a8a] hover:text-[#1e40af]">
                Tedarikçimiz Ol
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
