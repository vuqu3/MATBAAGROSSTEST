'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';

type AdminHeaderProps = {
  sidebarCollapsed: boolean;
  onMenuClick?: () => void;
  userEmail?: string | null;
  userName?: string | null;
};

export default function AdminHeader({
  sidebarCollapsed,
  onMenuClick,
  userEmail,
  userName,
}: AdminHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current && !profileRef.current.contains(e.target as Node) &&
        notifRef.current && !notifRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'Yeni toptan sipariş #1024 alındı', time: '5 dk önce', unread: true },
    { id: 2, text: 'Sipariş #1023 kargoya verildi', time: '1 saat önce', unread: false },
    { id: 3, text: '3 yeni üye kaydı', time: '2 saat önce', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Menü"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {/* Arama */}
        <div
          className={`relative flex items-center rounded-lg border bg-slate-50 transition-all duration-200 ${
            searchFocused ? 'border-slate-300 bg-white ring-1 ring-slate-200' : 'border-transparent'
          }`}
        >
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Sipariş, ürün veya müşteri ara..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="h-10 w-64 rounded-lg bg-transparent pl-10 pr-4 text-sm text-slate-800 placeholder-slate-500 outline-none md:w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Bildirimler */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Bildirimler"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white py-2">
              <div className="border-b border-slate-100 px-4 py-2">
                <h3 className="text-sm font-semibold text-slate-800">Bildirimler</h3>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`border-b border-slate-50 px-4 py-3 last:border-0 ${n.unread ? 'bg-slate-50/50' : ''}`}
                  >
                    <p className="text-sm text-slate-800">{n.text}</p>
                    <p className="mt-1 text-xs text-slate-500">{n.time}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 px-4 py-2">
                <button type="button" className="text-sm font-medium text-[#1e293b] hover:underline">
                  Tümünü gör
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profil menüsü */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e293b] text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-800">{userName || 'Yönetici'}</p>
              <p className="text-xs text-slate-500">{userEmail}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-medium text-slate-800">{userName || 'Yönetici'}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
