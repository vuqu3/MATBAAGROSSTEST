'use client';

import { Search, ShoppingCart, User, Truck, Crown, Factory, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';

interface NavbarChild {
  id: string;
  name: string;
  slug: string;
  order: number;
}

interface NavbarCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  children: NavbarChild[];
}

interface SubCategory {
  name: string;
  link: string;
}

interface MenuItem {
  id: string;
  name: string;
  link: string;
  subCategories: SubCategory[];
}

export default function Header() {
  const { data: session, status } = useSession();
  const { items: cartItems } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const cartCount = cartItems.length;
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/categories/navbar')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: NavbarCategory[]) => {
        if (cancelled) return;
        setMenuItems(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            link: `/urunler?kategori=${c.slug}`,
            subCategories: (c.children || []).map((ch) => ({
              name: ch.name,
              link: `/urunler?kategori=${ch.slug}`,
            })),
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setMenuItems([]);
      })
      .finally(() => {
        if (!cancelled) setMenuLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 overflow-visible">
      {/* Üst Bilgi Çubuğu (Top Bar) */}
      <div className="bg-gray-100 border-b border-gray-200 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center gap-4 py-1.5 text-xs">
            <Link href="/siparis-takip" className="flex items-center gap-1 text-[#484848] hover:text-[#FF6000] transition-colors">
              <Truck size={14} />
              <span>Sipariş Takibi</span>
            </Link>
            <Link href="/kampanyalar" className="text-[#484848] hover:text-[#FF6000] transition-colors">
              Kampanyalar
            </Link>
            <Link href="/grafik-ajanslar" className="text-[#484848] hover:text-[#FF6000] transition-colors">
              Grafikler & Ajanslar
            </Link>
            <Link href="/musteri-hizmetleri" className="text-[#484848] hover:text-[#FF6000] transition-colors">
              Müşteri Hizmetleri
            </Link>
            <Link
              href="/fason-uretim"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <Factory className="w-4 h-4 flex-shrink-0" />
              <span>Fason Üretim Merkezi</span>
            </Link>
            <Link
              href="/premium"
              className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-yellow-950 font-bold shadow-[0_0_10px_rgba(234,179,8,0.6)] overflow-hidden hover:shadow-[0_0_14px_rgba(234,179,8,0.75)] hover:from-yellow-500 hover:via-yellow-300 hover:to-yellow-500 transition-all duration-300"
            >
              <span className="pointer-events-none absolute inset-0 animate-premium-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2" aria-hidden />
              <Crown className="w-4 h-4 flex-shrink-0 text-yellow-950" />
              <span>MatbaaGross Premium</span>
            </Link>
            <Link href="/tedarikci-ol" className="text-[#484848] hover:text-[#FF6000] transition-colors">
              Tedarikçimiz Ol
            </Link>
          </div>
        </div>
      </div>

      {/* Ana Header */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <div className="flex items-center gap-2 md:flex-shrink-0">
            {session?.user?.role !== 'SELLER' && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg border border-gray-200 text-[#484848] hover:bg-gray-50"
                aria-label="Menüyü aç"
              >
                <Menu size={22} />
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex-1 md:flex-none md:flex-shrink-0 flex justify-center md:justify-start">
              <div className="flex items-center">
                <Image
                  src="/matbaagross-logo.png"
                  alt="MatbaaGross"
                  width={200}
                  height={56}
                  className="h-10 md:h-12 w-auto object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Arama Çubuğu */}
          <div className="w-full md:flex-1 md:max-w-4xl md:mx-auto">
            <form className="flex">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ürün, kategori veya stok kodu ara..."
                  className="w-full min-h-11 px-3 py-2 pl-3 pr-9 border border-gray-300 rounded-l-md focus:outline-none focus:border-[#FF6000] text-sm"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <button
                type="submit"
                className="min-h-11 bg-[#FF6000] hover:bg-[#e55a00] text-white font-semibold px-5 py-2 rounded-r-md transition-colors text-sm"
              >
                ARA
              </button>
            </form>
          </div>

          {/* Kullanıcı Alanı */}
          <div className="flex items-center justify-end gap-1.5 md:gap-4 flex-shrink-0">
            {session && status === 'authenticated' ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  className="flex flex-col items-center justify-center min-h-11 min-w-11 md:min-h-0 md:min-w-0 gap-0.5 px-2 py-1.5 text-[#484848] hover:text-[#FF6000] transition-colors"
                >
                  <User size={20} />
                  <span className="hidden lg:inline text-[10px] font-medium">
                    Hesabım
                  </span>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 bg-white py-2 shadow-lg z-50">
                    <Link
                      href={'/hesabim'}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setAccountOpen(false)}
                    >
                      <User size={16} />
                      Hesabım
                    </Link>
                    <button
                      type="button"
                      onClick={() => { signOut({ callbackUrl: '/' }); setAccountOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut size={16} />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : status !== 'loading' ? (
              <Link
                href="/login"
                className="flex flex-col items-center justify-center min-h-11 min-w-11 md:min-h-0 md:min-w-0 gap-0.5 px-2 py-1.5 text-[#484848] hover:text-blue-600 transition-colors"
              >
                <User size={20} />
                <span className="hidden lg:inline text-[10px] font-medium">Giriş Yap</span>
              </Link>
            ) : null}
            {session?.user?.role !== 'SELLER' && (
              <Link
                href="/sepetim"
                className="relative flex flex-col items-center justify-center min-h-11 min-w-11 md:min-h-0 md:min-w-0 gap-0.5 px-2 py-1.5 text-[#484848] hover:text-[#FF6000] transition-colors"
              >
                <ShoppingCart size={20} className="text-[#FF6000]" />
                <span className="hidden lg:inline text-[10px] font-medium">Sepetim</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#FF6000] text-white text-xs font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mega Menü - Dinamik (Admin panelinden yönetilen kategoriler) */}
      {(menuItems.length > 0 || menuLoading) && session?.user?.role !== 'SELLER' && (
        <nav className="bg-white border-t border-gray-200 relative overflow-visible hidden md:block">
          <div className="w-full px-4 max-w-[1440px] mx-auto">
            <ul className="flex items-center justify-between gap-4 whitespace-nowrap overflow-visible">
              {menuLoading ? (
                <li className="px-2 py-1.5 text-xs text-gray-400">Menü yükleniyor...</li>
              ) : (
                (() => {
                const categoryItems = menuItems.filter(
                  (item) =>
                    item.name !== 'Fason Üretim Merkezi' &&
                    !item.link.includes('fason-uretim-merkezi') &&
                    !item.link.includes('fason-hizmetler')
                );
                return categoryItems.map((item, index) => {
                  const isSecondHalf = index >= categoryItems.length / 2;
                  return (
                    <li
                      key={item.id}
                      className="relative flex-shrink-0 group flex items-center"
                    >
                      <Link
                        href={item.link}
                        className="px-2 py-1.5 font-semibold text-xs transition-colors whitespace-nowrap text-gray-700 hover:text-orange-600"
                      >
                        {item.name}
                      </Link>
                      {item.subCategories.length > 0 && (
                        <div className={`hidden group-hover:flex absolute top-full ${isSecondHalf ? 'right-0' : 'left-0'} w-auto min-w-[200px] whitespace-nowrap bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] z-[9999] border-t-2 border-orange-500 p-4`}>
                          <div className="w-full">
                            <Link
                              href={item.link}
                              className="block mb-3 pb-2 border-b border-gray-200 hover:text-orange-600 transition-colors"
                            >
                              <h3 className="font-bold text-base text-gray-800">{item.name}</h3>
                              <span className="text-xs text-gray-500">Tümünü Gör</span>
                            </Link>
                            <ul className="space-y-1">
                              {item.subCategories.map((subCategory, subIndex) => (
                                <li key={subIndex}>
                                  <Link
                                    href={subCategory.link}
                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                  >
                                    {subCategory.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                });
              })() )}
            </ul>
          </div>
        </nav>
      )}

      {mobileMenuOpen && session?.user?.role !== 'SELLER' && (
        <div className="md:hidden fixed inset-0 z-[9999]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Menüyü kapat"
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-bold text-[#484848]">Menü</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg hover:bg-gray-50 text-[#484848]"
                aria-label="Kapat"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-2 py-2">
                {menuLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Menü yükleniyor...</div>
                ) : (
                  <ul className="space-y-1">
                    {menuItems
                      .filter(
                        (item) =>
                          item.name !== 'Fason Üretim Merkezi' &&
                          !item.link.includes('fason-uretim-merkezi') &&
                          !item.link.includes('fason-hizmetler')
                      )
                      .map((item) => (
                        <li key={item.id}>
                          <Link
                            href={item.link}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 text-[#484848] font-semibold"
                          >
                            <span>{item.name}</span>
                          </Link>
                          {item.subCategories.length > 0 && (
                            <ul className="pl-3 pb-1">
                              {item.subCategories.map((sub) => (
                                <li key={sub.link}>
                                  <Link
                                    href={sub.link}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
