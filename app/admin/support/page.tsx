'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Headphones, ChevronRight, Inbox, Loader2 } from 'lucide-react';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  user?: { name: string | null; email: string };
  order?: { id: string; barcode: string | null; totalAmount: number } | null;
  messages?: { id: string; message: string }[];
};

const TAB_OPEN = 'OPEN';
const TAB_IN_PROGRESS = 'IN_PROGRESS';
const TAB_DONE = 'DONE';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Bekleyen',
  ANSWERED: 'Yanıtlandı',
  IN_PROGRESS: 'İşlemde',
  CLOSED: 'Kapatıldı',
  RESOLVED: 'Çözüldü',
};

function getTabForStatus(status: string): string {
  if (status === 'OPEN') return TAB_OPEN;
  if (status === 'IN_PROGRESS' || status === 'ANSWERED') return TAB_IN_PROGRESS;
  return TAB_DONE;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(TAB_OPEN);

  useEffect(() => {
    fetch('/api/admin/support-tickets', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Ticket[]) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) => getTabForStatus(t.status) === activeTab);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Headphones className="text-[#f97316]" size={22} />
        Destek Merkezi
      </h1>

      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-1">
          {[
            { key: TAB_OPEN, label: 'Bekleyenler' },
            { key: TAB_IN_PROGRESS, label: 'İşlemdekiler' },
            { key: TAB_DONE, label: 'Tamamlananlar' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#1e3a8a] text-[#1e3a8a] bg-[#1e3a8a]/5'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Bu kategoride talep yok.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/admin/support/${t.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">{t.subject}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {t.user?.name || t.user?.email || '—'} · {new Date(t.createdAt).toLocaleString('tr-TR')}
                      {t.order?.barcode && ` · ${t.order.barcode}`}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                    t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                  <ChevronRight className="flex-shrink-0 text-gray-400" size={18} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
