'use client';

import { useSession } from 'next-auth/react';
import { Package, FileText, Building2, User } from 'lucide-react';
import Link from 'next/link';

export default function HesabimPage() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const user = session.user;

  return (
    <div className="py-2 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Hesap Özeti</h1>
        <p className="text-gray-600 text-sm mt-0.5">Hoş geldiniz, {user.name || user.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-lg bg-[#1e3a8a]/10">
              <User className="h-5 w-5 text-[#1e3a8a]" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">Hesap Bilgileri</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Ad Soyad</dt>
              <dd className="font-medium text-gray-900">{user.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">E-posta</dt>
              <dd className="font-medium text-gray-900">{user.email}</dd>
            </div>
            {user.phoneNumber && (
              <div>
                <dt className="text-gray-500">Telefon</dt>
                <dd className="font-medium text-gray-900">{user.phoneNumber}</dd>
              </div>
            )}
            {user.companyName && (
              <div>
                <dt className="text-gray-500">Şirket</dt>
                <dd className="font-medium text-gray-900">{user.companyName}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Hesap Tipi</dt>
              <dd className="font-medium text-gray-900">
                {user.userType === 'CORPORATE' ? 'Kurumsal' : 'Bireysel'}
              </dd>
            </div>
          </dl>
          <Link
            href="/hesabim/fatura-bilgileri"
            className="mt-4 inline-block text-sm font-medium text-[#FF6000] hover:text-[#e55a00]"
          >
            Fatura bilgilerini güncelle →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-lg bg-[#FF6000]/10">
              <Package className="h-5 w-5 text-[#FF6000]" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">Siparişlerim</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Son siparişlerinizi görüntüleyin ve takip edin.
          </p>
          <Link
            href="/hesabim/siparisler"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1e3a8a] hover:text-[#1e40af]"
          >
            Siparişlerime git
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#1e3a8a]" />
          Son Siparişler
        </h2>
        <div className="text-center py-8 text-gray-500">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm">Henüz siparişiniz bulunmuyor.</p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-[#FF6000] hover:text-[#e55a00]"
          >
            Alışverişe başla
          </Link>
        </div>
      </div>
    </div>
  );
}
