'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, MessageSquare, RefreshCw, CreditCard, X } from 'lucide-react';

type QuoteMessageDto = {
  id: string;
  quoteId: string;
  senderId: string;
  receiverId: string;
  type?: 'TEXT' | 'PAYMENT_REQUEST';
  content: string;
  agreedPrice?: number | null;
  agreedDeliveryDays?: number | null;
  agreedDescription?: string | null;
  isSystemMessage?: boolean;
  createdAt: string;
};

type QuoteMessagesResponse = {
  quoteId: string;
  participants: {
    customerId: string | null;
    sellerId: string;
    me: string;
  };
  messages: QuoteMessageDto[];
};

type QuoteChatBoxProps = {
  quoteId: string;
  title?: string;
  className?: string;
  pollMs?: number;
};

export default function QuoteChatBox({ quoteId, title = 'Satıcıya Soru Sor / Mesajlar', className, pollMs = 6000 }: QuoteChatBoxProps) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuoteMessagesResponse | null>(null);
  const [text, setText] = useState('');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payPrice, setPayPrice] = useState('');
  const [payDays, setPayDays] = useState('');
  const [payDesc, setPayDesc] = useState('');

  const listRef = useRef<HTMLDivElement>(null);

  const me = data?.participants?.me || '';
  const isSeller = Boolean(me && data?.participants?.sellerId && me === data.participants.sellerId);

  const messages = useMemo(() => {
    return Array.isArray(data?.messages) ? data!.messages : [];
  }, [data]);

  const fetchMessages = async (silent = false) => {
    if (!quoteId) return;
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${encodeURIComponent(quoteId)}/messages`, { cache: 'no-store' });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Mesajlar alınamadı');
        setData(null);
        return;
      }
      setData(json as QuoteMessagesResponse);
    } catch {
      setError('Mesajlar alınamadı');
      setData(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId]);

  useEffect(() => {
    if (!pollMs) return;
    const t = window.setInterval(() => {
      fetchMessages(true);
    }, pollMs);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId, pollMs]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const send = async () => {
    const content = text.trim();
    if (!content || !quoteId) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${encodeURIComponent(quoteId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Mesaj gönderilemedi');
        return;
      }

      setText('');
      await fetchMessages(true);
    } catch {
      setError('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  const createPaymentRequest = async () => {
    if (!quoteId) return;
    const price = Number(payPrice);
    const days = parseInt(String(payDays), 10);
    const desc = payDesc.trim();

    if (!Number.isFinite(price) || price <= 0) {
      setError('Geçerli bir nihai tutar girin');
      return;
    }
    if (!Number.isFinite(days) || days <= 0) {
      setError('Geçerli bir üretim/teslimat süresi girin');
      return;
    }
    if (!desc) {
      setError('Açıklama zorunlu');
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${encodeURIComponent(quoteId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PAYMENT_REQUEST',
          agreedPrice: price,
          agreedDeliveryDays: days,
          agreedDescription: desc,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Ödeme linki oluşturulamadı');
        return;
      }

      setPayModalOpen(false);
      setPayPrice('');
      setPayDays('');
      setPayDesc('');
      await fetchMessages(true);
    } catch {
      setError('Ödeme linki oluşturulamadı');
    } finally {
      setSending(false);
    }
  };

  if (!quoteId) {
    return null;
  }

  return (
    <div className={className || ''}>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="h-4 w-4 text-[#FF6000]" />
            <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
          </div>
          <button
            type="button"
            onClick={() => fetchMessages(false)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>

        <div ref={listRef} className="h-[320px] overflow-y-auto bg-gray-50 px-4 py-3 space-y-2">
          {loading ? (
            <div className="text-sm text-gray-600">Yükleniyor...</div>
          ) : error ? (
            <div className="text-sm text-red-700">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-gray-600">Henüz mesaj yok. Sorunuzu yazın.</div>
          ) : (
            messages.map((m) => {
              const mine = me && m.senderId === me;
              const type = (m.type || 'TEXT').toUpperCase();

              if (m.isSystemMessage) {
                const isAlert = typeof m.content === 'string' && m.content.includes('🚨');
                return (
                  <div key={m.id} className="flex justify-center">
                    <div
                      className={`max-w-[92%] sm:max-w-[560px] rounded-xl border px-4 py-3 text-sm font-semibold text-center ${
                        isAlert
                          ? 'border-red-200 bg-red-50 text-red-800'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                      <div className={`mt-1 text-[11px] font-medium ${isAlert ? 'text-red-700/80' : 'text-emerald-800/80'}`}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleString('tr-TR') : ''}
                      </div>
                    </div>
                  </div>
                );
              }

              if (type === 'PAYMENT_REQUEST') {
                const amount = typeof m.agreedPrice === 'number' && Number.isFinite(m.agreedPrice)
                  ? `${m.agreedPrice.toLocaleString('tr-TR')} TL`
                  : '-';
                const details = (m.agreedDescription || '').trim();
                const days = typeof m.agreedDeliveryDays === 'number' && Number.isFinite(m.agreedDeliveryDays)
                  ? m.agreedDeliveryDays
                  : null;

                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[90%] w-full sm:w-[420px] rounded-2xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
                      <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-emerald-700" />
                          <p className="text-sm font-semibold text-emerald-900">Ödeme Kartı</p>
                        </div>
                        <p className="text-sm font-extrabold text-emerald-800">{amount}</p>
                      </div>

                      <div className="p-4">
                        {details ? <p className="text-sm text-gray-800 whitespace-pre-wrap">{details}</p> : null}
                        {days ? (
                          <p className="text-xs text-gray-500 mt-2">Üretim/Teslimat: {days} Gün</p>
                        ) : null}

                        <div className="mt-4">
                          <a
                            href={`/checkout/premium/${encodeURIComponent(String(m.quoteId))}`}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold px-4 py-3 transition-colors"
                          >
                            <ShieldText />
                            PayTR ile Güvenli Öde
                          </a>
                          <p className="text-[11px] text-gray-500 mt-2">
                            Ödeme ekranına yönlendirilirsiniz. Kart bilgileriniz Matbaagross tarafından saklanmaz.
                          </p>
                        </div>
                      </div>

                      <div className="px-4 pb-3 text-[11px] text-gray-500">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString('tr-TR') : ''}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm border ${
                      mine
                        ? 'bg-[#FF6000] text-white border-[#FF6000]'
                        : 'bg-white text-gray-900 border-gray-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    <div className={`mt-1 text-[11px] ${mine ? 'text-white/80' : 'text-gray-500'}`}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleString('tr-TR') : ''}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-gray-100 bg-white">
          {isSeller ? (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => {
                  setPayModalOpen(true);
                  setError(null);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold px-4 py-3 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Anlaşmalı Ödeme Linki Oluştur
              </button>
            </div>
          ) : null}

          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#FF6000] focus:border-[#FF6000]"
              placeholder="Mesajınızı yazın..."
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || !text.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6000] px-4 py-2.5 text-white text-sm font-bold hover:bg-[#e55a00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Gönder
            </button>
          </div>
        </div>
      </div>

      {payModalOpen ? (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={() => setPayModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Anlaşmalı Ödeme Linki Oluştur</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Not: PayTR kredi kartı işlemlerinde %3.2 altyapı kesintisi uygulamaktadır. Lütfen fiyatınızı bu kesintiyi göz önünde bulundurarak belirleyiniz.
                </p>
              </div>
              <button type="button" className="p-2 rounded-full hover:bg-gray-100" onClick={() => setPayModalOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Nihai Tutar (TL)</label>
                <input
                  value={payPrice}
                  onChange={(e) => setPayPrice(e.target.value)}
                  inputMode="decimal"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  placeholder="Örn: 12500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600">Üretim/Teslimat Süresi (Gün)</label>
                <input
                  value={payDays}
                  onChange={(e) => setPayDays(e.target.value)}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  placeholder="Örn: 7"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600">Kısa Açıklama</label>
                <textarea
                  value={payDesc}
                  onChange={(e) => setPayDesc(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  placeholder="Örn: 10.000 adet, 350gr, Altın Yaldızlı"
                />
              </div>

              {error ? <div className="text-sm text-red-700">{error}</div> : null}

              <button
                type="button"
                onClick={createPaymentRequest}
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold px-4 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CreditCard className="h-4 w-4" />
                {sending ? 'Oluşturuluyor...' : 'Ödeme Linkini Oluştur'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ShieldText() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
