'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const legalLinks = [
  { href: '/uyelik-sozlesmesi', label: 'Üyelik Sözleşmesi' },
  { href: '/mesafeli-satis', label: 'Mesafeli Satış Sözleşmesi' },
  { href: '/gizlilik', label: 'Gizlilik ve Çerez Politikası' },
  { href: '/iade-sartlari', label: 'İptal ve İade Şartları' },
  { href: '/kargo-sozlesmesi', label: 'Kargo Sözleşmesi' },
  { href: '/kvkk', label: 'Kişisel Verilerin Korunması' },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-1/4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-[#1e3a8a] px-5 py-4">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Sayfalar</h2>
              </div>
              <nav className="p-2">
                <ul className="space-y-0.5">
                  {legalLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                            isActive
                              ? 'bg-orange-50 text-[#f97316] font-semibold border-l-4 border-[#f97316]'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-[#f97316] border-l-4 border-transparent'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:w-3/4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
