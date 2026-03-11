'use client';

import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home, Package, Copy, Check } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

type PaymentMethod = 'CARD' | 'BANK_TRANSFER';

type TrackOrderResponse = {
  barcode: string | null;
  status: string;
  paymentStatus?: string;
  paymentMethod?: PaymentMethod;
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderNoFromQuery = searchParams.get('orderNo') || '';
  const orderIdFromQuery = searchParams.get('orderId') || '';
  const [orderNumber, setOrderNumber] = useState(orderNoFromQuery);
  const [visible, setVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'recipient' | 'iban' | 'orderNo' | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const copyText = async (key: 'recipient' | 'iban' | 'orderNo', text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', 'true');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let pollTimer: number | null = null;
    let cancelled = false;

    const run = async () => {
      const code = (orderNoFromQuery || orderIdFromQuery).trim();
      if (!code) return;
      try {
        setIsCheckingPayment(true);
        const res = await fetch(`/api/orders/track?code=${encodeURIComponent(code)}`);
        if (!res.ok) return;
        const data = (await res.json()) as TrackOrderResponse;

        if (!orderNoFromQuery) {
          const resolved = typeof data?.barcode === 'string' ? data.barcode.trim() : '';
          if (resolved) setOrderNumber(resolved);
        } else {
          setOrderNumber(orderNoFromQuery);
        }

        if (data?.paymentMethod) setPaymentMethod(data.paymentMethod);
        if (typeof data?.paymentStatus === 'string') setPaymentStatus(data.paymentStatus);

        const method = data?.paymentMethod;
        const status = data?.paymentStatus;

        // CART CLEAR RULES:
        // - BANK_TRANSFER: order is created and user should proceed with transfer -> clear cart immediately
        // - CARD: clear cart only after PayTR callback sets paymentStatus=PAID
        if (method === 'BANK_TRANSFER') {
          clearCart();
        }
        if (method === 'CARD' && status === 'PAID') {
          clearCart();
        }

        // If card payment not yet paid, keep polling for callback updates.
        if (method === 'CARD' && status !== 'PAID') {
          if (pollTimer) window.clearTimeout(pollTimer);
          pollTimer = window.setTimeout(() => {
            if (!cancelled) run();
          }, 2500);
        }
      } catch {
        // ignore
      } finally {
        setIsCheckingPayment(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
    };
  }, [clearCart, orderIdFromQuery, orderNoFromQuery]);

  const isCardPending = paymentMethod === 'CARD' && paymentStatus !== 'PAID';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div
        className={`max-w-md w-full text-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg shadow-green-100">
            <CheckCircle size={52} className="text-green-500" strokeWidth={1.5} />
          </div>
        </div>

        {paymentMethod === 'BANK_TRANSFER' && orderNumber ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6 text-left">
            <div className="text-sm font-extrabold text-gray-900 mb-3">Havale / EFT Bilgileri</div>
            <div className="space-y-1.5 text-sm text-gray-800">
              <div>
                <span className="font-semibold">Alıcı:</span>{' '}
                <span className="inline-flex items-center gap-2">
                  <span>SB OFSET VE MATBAACILIK SANAYİ TİCARET LİMİTED ŞİRKETİ</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        'recipient',
                        'SB OFSET VE MATBAACILIK SANAYİ TİCARET LİMİTED ŞİRKETİ'
                      )
                    }
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-orange-200 bg-white text-orange-700 hover:bg-orange-100 transition-colors"
                    aria-label="Alıcı adını kopyala"
                  >
                    {copiedKey === 'recipient' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </span>
              </div>
              <div>
                <span className="font-semibold">Banka:</span> YAPI VE KREDİ BANKASI A.Ş.
              </div>
              <div>
                <span className="font-semibold">IBAN:</span>{' '}
                <span className="inline-flex items-center gap-2">
                  <span className="font-mono">TR070006701000000030742376</span>
                  <button
                    type="button"
                    onClick={() => copyText('iban', 'TR070006701000000030742376')}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-orange-200 bg-white text-orange-700 hover:bg-orange-100 transition-colors"
                    aria-label="IBAN kopyala"
                  >
                    {copiedKey === 'iban' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </span>
              </div>
            </div>
            <div className="mt-4 text-sm font-bold text-orange-900">
              Lütfen ödeme yaparken bankanızın açıklama kısmına{' '}
              <span className="inline-flex items-center gap-2">
                <span className="underline underline-offset-2">{orderNumber}</span>
                <button
                  type="button"
                  onClick={() => copyText('orderNo', orderNumber)}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-orange-200 bg-white text-orange-700 hover:bg-orange-100 transition-colors"
                  aria-label="Sipariş numarasını kopyala"
                >
                  {copiedKey === 'orderNo' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </span>{' '}
              yazmayı unutmayın.
            </div>
          </div>
        ) : null}

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          {isCardPending ? 'Ödeme Bekleniyor' : 'Siparişiniz Alındı!'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {paymentMethod === 'BANK_TRANSFER'
            ? 'Siparişiniz alındı. Ödeme havale/EFT ile tamamlandığında siparişiniz işleme alınacaktır.'
            : isCardPending
              ? 'Ödeme onayı bekleniyor. Ödeme tamamlandığında bu sayfa otomatik olarak güncellenecektir.'
              : 'Ödemeniz başarıyla gerçekleşti. Siparişiniz en kısa sürede hazırlanacaktır.'}
        </p>

        {isCardPending ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-left">
            <div className="text-sm font-extrabold text-gray-900 mb-2">PayTR Onayı Bekleniyor</div>
            <div className="text-sm text-gray-700">
              {isCheckingPayment ? 'Durum kontrol ediliyor…' : 'Durum kontrol ediliyor.'}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Ödeme başarılı ise birkaç saniye içinde otomatik güncellenecek. Güncellenmezse sayfayı yenileyebilirsiniz.
            </div>
          </div>
        ) : null}

        {/* Order number card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-2">
            <Package size={14} />
            <span className="uppercase tracking-widest font-semibold">Sipariş Numaranız</span>
          </div>
          {orderNumber ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-black text-[#FF6000] tracking-widest">#{orderNumber}</div>
                <button
                  type="button"
                  onClick={() => copyText('orderNo', orderNumber)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                  aria-label="Sipariş numarasını kopyala"
                >
                  {copiedKey === 'orderNo' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Bu numarayı not alın. Sipariş takibinde kullanabilirsiniz.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Sipariş numaranızı{' '}
              <Link href="/hesabim/siparisler" className="text-[#FF6000] underline underline-offset-2 hover:text-[#ea580c]">
                siparişleriniz
              </Link>{' '}
              sayfasından kontrol edebilirsiniz.
            </p>
          )}
        </div>

        {/* Info boxes */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-left shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tahmini Teslimat</div>
            <div className="text-sm font-bold text-gray-800">3–5 İş Günü</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-left shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bildirim</div>
            <div className="text-sm font-bold text-gray-800">E-posta ile</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Home size={16} />
            Ana Sayfa
          </Link>
          <Link
            href="/urunler"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF6000] to-[#ea580c] text-white text-sm font-bold hover:from-[#ea580c] hover:to-[#c2410c] transition-all shadow-lg shadow-orange-200"
          >
            <ShoppingBag size={16} />
            Alışverişe Devam
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SiparisBasariliPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Sipariş bilgileriniz yükleniyor...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
