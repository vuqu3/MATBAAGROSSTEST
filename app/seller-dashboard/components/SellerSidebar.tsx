'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Inbox,
  Send,
  ShoppingCart,
  MessageCircle,
  Settings,
  ChevronLeft,
} from 'lucide-react';

const mainNavItems: { label: string; href: string; icon: React.ElementType }[] = [
  { label: 'Özet', href: '/seller-dashboard/overview', icon: LayoutDashboard },
  { label: 'Ürünlerim', href: '/seller-dashboard/products', icon: Package },
  { label: 'Siparişler', href: '/seller-dashboard/orders', icon: ShoppingCart },
  { label: 'Teklif Havuzu', href: '/seller-dashboard/teklif-havuzu', icon: Inbox },
  { label: 'Verilen Teklifler', href: '/seller-dashboard/verilen-teklifler', icon: Send },
  { label: 'Müşteri Soruları', href: '/seller-dashboard/questions', icon: MessageCircle },
  { label: 'Mağaza Ayarları', href: '/seller-dashboard/settings', icon: Settings },
];

export default function SellerSidebar({
  collapsed,
  onToggle,
  vendorName,
}: {
  collapsed: boolean;
  onToggle: () => void;
  vendorName: string;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/seller-dashboard/overview' && pathname.startsWith(href));
  const isProductsNew = pathname === '/seller-dashboard/products/new';

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-full flex flex-col bg-white border-r border-gray-200 transition-[width] duration-300 ease-in-out"
      style={{ width: collapsed ? 72 : 260 }}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4 shrink-0">
        {!collapsed && (
          <Link
            href="/seller-dashboard/overview"
            className="flex items-center gap-2 truncate min-w-0"
          >
            <span className="text-lg font-semibold truncate">
              <span className="text-[#FF6000]">MatbaaGross</span>
              <span className="text-gray-400 font-normal mx-1">|</span>
              <span className="text-gray-900">Seller</span>
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-colors shrink-0"
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
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isProducts = item.href === '/seller-dashboard/products';

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border-l-4 ${
                    active
                      ? 'bg-orange-50 text-orange-600 border-orange-600'
                      : 'border-transparent text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
                {isProducts && !collapsed && (
                  <Link
                    href="/seller-dashboard/products/new"
                    className={`flex items-center gap-3 rounded-lg py-2 pl-11 pr-3 text-sm font-medium transition-colors border-l-4 ${
                      isProductsNew
                        ? 'bg-orange-50 text-orange-600 border-orange-600'
                        : 'border-transparent text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <PlusCircle className="h-4 w-4 shrink-0" />
                    <span>Yeni Ürün Ekle</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
