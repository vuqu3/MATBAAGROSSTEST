'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileText, MapPin, LogOut, Package, Headphones, User, Crown } from 'lucide-react';

const navItems = [
  { href: '/hesabim', label: 'Özet', icon: LayoutDashboard },
  { href: '/hesabim/siparisler', label: 'Siparişlerim', icon: Package },
  { href: '/hesabim/premium-islerim', label: 'Premium İşlerim', icon: Crown },
  { href: '/hesabim/destek-taleplerim', label: 'Destek Taleplerim', icon: Headphones },
  { href: '/hesabim/fatura-bilgileri', label: 'Fatura Bilgileri', icon: FileText },
  { href: '/hesabim/adresler', label: 'Adresler', icon: MapPin },
];

export default function HesabimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris?callbackUrl=/hesabim');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const displayName = (session.user as { name?: string })?.name || session.user?.email?.split('@')[0] || 'Üye';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#FF6000]">Matbaa</span>
              <span className="text-lg font-bold text-[#1e3a8a]">Gross</span>
            </Link>
            <p className="text-xs text-gray-500">{session.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-br from-[#1e3a8a]/10 to-[#1e3a8a]/5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#1e3a8a]/20 flex items-center justify-center">
                    <User size={18} className="text-[#1e3a8a]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hoş geldiniz,</p>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{displayName}</p>
                  </div>
                </div>
              </div>
              <nav className="p-2 space-y-0.5">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = href === '/hesabim' ? pathname === '/hesabim' : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#1e3a8a] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {label}
                    </Link>
                  );
                })}
                <hr className="my-2 border-gray-100" />
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 text-left"
                >
                  <LogOut size={18} />
                  Çıkış Yap
                </button>
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
