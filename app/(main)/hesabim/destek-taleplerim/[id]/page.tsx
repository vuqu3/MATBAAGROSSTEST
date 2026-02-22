'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

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
  order?: { barcode: string | null } | null;
  messages: Message[];
};

export default function DestekTalebiDetayPage() {
  const params = useParams();
  const id = params?.id as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTicket = () => {
    if (!id) return;
    fetch(`/api/support-tickets/${id}`, { credentials: 'include' })
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

  const handleSend = async () => {
    const msg = reply.trim();
    if (!msg || !id || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support-tickets/${id}/messages`, {
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
        <Link href="/hesabim/destek-taleplerim" className="text-sm font-medium text-[#1e3a8a] hover:underline">
          ← Taleplerime dön
        </Link>
      </div>
    );
  }

  return (
    <div className="py-2 flex flex-col h-[calc(100vh-12rem)] max-h-[600px]">
      <Link
        href="/hesabim/destek-taleplerim"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#1e3a8a] mb-3"
      >
        <ArrowLeft size={16} />
        Taleplerime dön
      </Link>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h1 className="font-semibold text-gray-900">{ticket.subject}</h1>
          {ticket.order?.barcode && (
            <p className="text-xs text-gray-500 mt-0.5">Sipariş: {ticket.order.barcode}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {ticket.messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.isStaffReply ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  m.isStaffReply
                    ? 'bg-white border border-gray-200 rounded-bl-md'
                    : 'bg-[#1e3a8a] text-white rounded-br-md'
                }`}
              >
                {m.isStaffReply && (
                  <p className="text-xs font-semibold text-gray-500 mb-1">MatbaaGross Destek</p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>
                <p className={`text-[10px] mt-1 ${m.isStaffReply ? 'text-gray-400' : 'text-white/80'}`}>
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
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Yanıtınızı yazın..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              className="px-4 py-2.5 bg-[#1e3a8a] text-white rounded-xl text-sm font-medium hover:bg-[#1e40af] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
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
