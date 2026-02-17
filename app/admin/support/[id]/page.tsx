'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, CheckCircle, Send } from 'lucide-react';

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
  user?: { name: string | null; email: string; phoneNumber?: string | null };
  order?: { id: string; barcode: string | null; totalAmount: number; status: string; createdAt: string } | null;
  messages: Message[];
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Bekleyen',
  ANSWERED: 'Yanıtlandı',
  IN_PROGRESS: 'İşlemde',
  CLOSED: 'Kapatıldı',
  RESOLVED: 'Çözüldü',
};

export default function AdminSupportDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTicket = () => {
    if (!id) return;
    fetch(`/api/admin/support-tickets/${id}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Ticket | null) => setTicket(data ?? null))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSendReply = async () => {
    const msg = reply.trim();
    if (!msg || !id || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support-tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTicket(updated);
        setReply('');
      }
    } finally {
      setSending(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!id) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support-tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTicket(updated);
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-2">
        <p className="text-gray-500 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-2">
        <p className="text-gray-600 text-sm mb-4">Talep bulunamadı.</p>
        <Link href="/admin/support" className="text-sm font-medium text-[#1e3a8a] hover:underline">
          ← Destek listesine dön
        </Link>
      </div>
    );
  }

  return (
    <div className="py-2 flex flex-col h-[calc(100vh-8rem)] max-h-[700px]">
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#1e3a8a] mb-3"
      >
        <ArrowLeft size={16} />
        Destek listesine dön
      </Link>

      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{ticket.subject}</h1>
            <p className="text-xs text-gray-500">
              {ticket.user?.name || ticket.user?.email} · {new Date(ticket.createdAt).toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
              ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {STATUS_LABELS[ticket.status] ?? ticket.status}
            </span>
            {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
              <button
                type="button"
                onClick={handleMarkResolved}
                disabled={sending}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle size={14} />
                Çözüldü
              </button>
            )}
          </div>
        </div>

        {ticket.order && (
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between gap-2 bg-gray-50/50">
            <p className="text-sm text-gray-700">
              Sipariş: {ticket.order.barcode || `#${ticket.order.id.slice(-8)}`} · {Number(ticket.order.totalAmount).toLocaleString('tr-TR')} TL
            </p>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#1e3a8a] hover:underline"
            >
              <Package size={14} />
              Siparişe git
            </Link>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
          {ticket.messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.isStaffReply ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  m.isStaffReply
                    ? 'bg-[#1e3a8a] text-white rounded-bl-md'
                    : 'bg-white border border-gray-200 rounded-br-md'
                }`}
              >
                {m.isStaffReply && (
                  <p className="text-xs font-semibold text-white/90 mb-1">Destek Ekibi</p>
                )}
                {!m.isStaffReply && (
                  <p className="text-xs font-semibold text-gray-500 mb-1">Müşteri</p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>
                <p className={`text-[10px] mt-1 ${m.isStaffReply ? 'text-white/80' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
              placeholder="Yanıt yazın..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
            />
            <button
              type="button"
              onClick={handleSendReply}
              disabled={sending || !reply.trim()}
              className="px-4 py-2.5 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-[#1e40af] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
            >
              <Send size={18} />
              Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
