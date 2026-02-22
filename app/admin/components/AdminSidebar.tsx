'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Package,
  ShoppingCart,
  Store,
  Image,
  Users,
  Settings,
} from 'lucide-react';

const SIDEBAR_BG = '#1e293b';

type SubItem = { label: string; href: string };
type NavGroup = {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: SubItem[];
};

const navGroups: NavGroup[] = [
  { label: 'Genel Bakış', icon: LayoutDashboard, href: '/admin' },
  {
    label: 'Katalog Yönetimi',
    icon: Package,
    children: [
      { label: 'Ürünler', href: '/admin/products' },
      { label: 'Kategoriler', href: '/admin/categories' },
      { label: 'Özellikler', href: '/admin/attributes' },
    ],
  },
  {
    label: 'Sipariş Yönetimi',
    icon: ShoppingCart,
    children: [
      { label: 'Tüm Siparişler', href: '/admin/orders' },
      { label: 'İptal / İade Talepleri', href: '/admin/orders/returns' },
    ],
  },
  {
    label: 'Satıcılar & Finans',
    icon: Store,
    children: [
      { label: 'Satıcı Listesi', href: '/admin/vendors' },
      { label: 'Başvurular', href: '/admin/supplier-applications' },
      { label: 'Komisyon Raporları', href: '/admin/finance' },
      { label: 'Mutabakat', href: '/admin/reconciliation' },
    ],
  },
  {
    label: 'Vitrin & Reklam',
    icon: Image,
    children: [
      { label: 'Banner Yönetimi', href: '/admin/banners' },
      { label: 'Öne Çıkanlar', href: '/admin/featured' },
    ],
  },
  {
    label: 'Müşteriler & Destek',
    icon: Users,
    children: [
      { label: 'Kullanıcılar', href: '/admin/customers' },
      { label: 'Destek Talepleri', href: '/admin/support' },
    ],
  },
  {
    label: 'Ayarlar',
    icon: Settings,
    children: [
      { label: 'Site Ayarları', href: '/admin/settings' },
      { label: 'Kargo', href: '/admin/settings/shipping' },
      { label: 'Ödeme', href: '/admin/settings/payment' },
    ],
  },
];

export default function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Katalog Yönetimi': true,
    'Sipariş Yönetimi': true,
  });

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const isGroupOpen = (label: string) => {
    if (collapsed) return false;
    return openGroups[label] ?? false;
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-full flex flex-col text-white border-r border-white/10 transition-[width] duration-300 ease-in-out"
      style={{ backgroundColor: SIDEBAR_BG, width: collapsed ? 72 : 260 }}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4 shrink-0">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#f97316]">Matbaa</span>
            <span className="text-xl font-bold">Gross</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors shrink-0"
          aria-label={collapsed ? 'Menüyü aç' : 'Menüyü kapat'}
        >
          <ChevronLeft
            className="h-5 w-5 transition-transform duration-300"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-2 space-y-0.5">
          {navGroups.map((group) => {
            const Icon = group.icon;
            if (group.href) {
              const active = isActive(group.href);
              return (
                <Link
                  key={group.label}
                  href={group.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{group.label}</span>}
                </Link>
              );
            }
            const open = isGroupOpen(group.label);
            const hasActiveChild = group.children?.some((c) => isActive(c.href));
            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    hasActiveChild ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      {open ? (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                    </>
                  )}
                </button>
                {!collapsed && open && group.children && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
                    {group.children.map((child) => {
                      const active = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                            active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
