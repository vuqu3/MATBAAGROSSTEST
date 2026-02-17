'use client';

import { signOut } from 'next-auth/react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type SellerHeaderProps = {
  sidebarCollapsed: boolean;
  onMenuClick?: () => void;
  userEmail?: string | null;
  userName?: string | null;
};

export default function SellerHeader({
  onMenuClick,
  userEmail,
  userName,
}: SellerHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <h1 className="text-lg font-semibold text-slate-800">Satıcı Paneli</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6000] text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-800">{userName || 'Satıcı'}</p>
              <p className="text-xs text-slate-500">{userEmail}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-medium text-slate-800">{userName || 'Satıcı'}</p>
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
