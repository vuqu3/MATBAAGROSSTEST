'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, AlertCircle } from 'lucide-react';

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const registered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registered) setError('');
  }, [registered]);

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
        // Rol kontrolü: SELLER ise kendi paneline yönlendir
        const session = await getSession();
        const role = (session?.user as { role?: string })?.role;

        if (role === 'SELLER') {
          router.push('/seller-dashboard');
        } else {
          router.push(callbackUrl);
        }
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
        {/* Kart — hafif oval köşeler, hafif gölge */}
        <div className="bg-white shadow-md border border-gray-200 px-8 py-8 rounded-lg">
          {/* Kart içi mini logo */}
          <Link href="/" className="flex justify-center mb-6">
            <Image
              src="/logo.svg"
              alt="Matbaagross Logo"
              width={200}
              height={60}
              className="h-10 w-auto mx-auto object-contain"
            />
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Merhaba, Giriş Yap veya Üye Ol
          </h1>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full mb-4 py-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <span className="inline-flex items-center justify-center w-5 h-5">
              <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.26 3.62l6.9-6.9C36.02 2.38 30.4 0 24 0 14.64 0 6.44 5.38 2.56 13.22l8.02 6.23C12.5 13.3 17.77 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.43-4.74H24v9.02h12.65c-.55 2.97-2.2 5.49-4.67 7.18l7.24 5.62C43.73 36.86 46.5 30.98 46.5 24z"/>
                <path fill="#FBBC05" d="M10.58 28.45c-.5-1.49-.78-3.08-.78-4.45s.28-2.96.78-4.45l-8.02-6.23C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.68l8.02-6.23z"/>
                <path fill="#34A853" d="M24 48c6.4 0 12.02-2.12 16.22-5.76l-7.24-5.62c-2.01 1.35-4.59 2.13-8.98 2.13-6.23 0-11.5-3.8-13.42-9.95l-8.02 6.23C6.44 42.62 14.64 48 24 48z"/>
              </svg>
            </span>
            Google ile Giriş Yap
          </button>

          {registered && (
            <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-800 text-sm text-center">
              Kayıt başarılı. Giriş yapabilirsiniz.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 flex items-center gap-2 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="giris-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="giris-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent text-gray-800 placeholder-gray-400 text-sm bg-gray-50"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="giris-password" className="block text-sm font-medium text-gray-700">
                  Şifre
                </label>
                <Link href="/sifremi-unuttum" className="text-xs text-[#FF6000] hover:text-[#e55a00] font-medium">
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="giris-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent text-gray-800 placeholder-gray-400 text-sm bg-gray-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#FF6000] hover:bg-[#e55a00] active:bg-[#cc5200] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base mt-1"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push('/sepetim/onay?guest=true')}
            className="w-full mt-3 py-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold rounded-lg transition-colors text-base"
          >
            Üye Olmadan Devam Et
          </button>

          <p className="text-sm text-gray-500 text-center mt-6">
            Hesabın yok mu?{' '}
            <Link href="/kayit-ol" className="font-semibold text-[#FF6000] hover:text-[#e55a00]">
              Üye Ol
            </Link>
          </p>
        </div>
      </div>
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
      <LoginPageInner />
    </Suspense>
  );
}
