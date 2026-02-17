'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Headphones, ChevronRight } from 'lucide-react';

type Message = {
  id: string;
  message: string;
  isStaffReply: boolean;
  createdAt: string;
};

type Ticket = {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  order?: { id: string; barcode: string | null } | null;
  messages: Message[];
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Bekleyen',
  ANSWERED: 'Yanıtlandı',
  IN_PROGRESS: 'İşlemde',
  CLOSED: 'Kapatıldı',
  RESOLVED: 'Çözüldü',
};

export default function DestekTaleplerimPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/support-tickets', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Ticket[]) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-2">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Destek Taleplerim</h1>
        <p className="text-gray-500 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Destek Taleplerim</h1>
      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <Headphones className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-600 text-sm">Henüz destek talebiniz yok.</p>
          <p className="text-gray-500 text-xs mt-1">Siparişlerim sayfasındaki &quot;Sorun Bildir / Destek Al&quot; ile talep oluşturabilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const firstMsg = t.messages[0];
            const hasStaffReply = t.messages.some((m) => m.isStaffReply);
            const isAnswered = hasStaffReply || t.status === 'ANSWERED' || t.status === 'RESOLVED';

            return (
              <Link
                key={t.id}
                href={`/hesabim/destek-taleplerim/${t.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-[#1e3a8a]/30 hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 text-sm">{t.subject}</span>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      isAnswered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </div>
                {t.order?.barcode && (
                  <p className="text-xs text-gray-500 mt-1">Sipariş: {t.order.barcode}</p>
                )}
                {firstMsg && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{firstMsg.message}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleString('tr-TR')} · {t.messages.length} mesaj
                  </p>
                  <ChevronRight className="text-gray-400" size={18} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
