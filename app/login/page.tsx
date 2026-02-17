'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    router.replace(callbackUrl);
    router.refresh();
  }, [status, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-500">Yükleniyor...</div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex justify-center mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6000] rounded-lg"
        >
          <Image
            src="/matbaagross-logo.png"
            alt="MatbaaGross"
            width={220}
            height={62}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-orange-100/80 p-8">
          <h1 className="text-xl font-bold text-slate-800 text-center mb-1">
            Giriş Yap
          </h1>
          <p className="text-center text-slate-500 text-sm mb-6">
            E-posta ve şifrenizle giriş yapın
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent text-slate-800 placeholder-slate-400"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent text-slate-800 placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF6000] hover:bg-[#e55a00] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p className="text-center text-slate-600 text-sm mt-6">
            Hesabınız yok mu?{' '}
            <Link
              href="/kayit-ol"
              className="font-semibold text-[#FF6000] hover:text-[#e55a00] transition-colors"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          Tedarikçi paneli veya müşteri hesabı için aynı girişi kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
}
