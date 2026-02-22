'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ChevronRight, Headphones, X, FileDown } from 'lucide-react';

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  imageUrl?: string | null;
};

type Order = {
  id: string;
  barcode?: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  invoiceUrl?: string | null;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED: 'Kargoya Verildi',
  COMPLETED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  RETURNED: 'İade Edildi',
  REFUNDED: 'Geri Ödendi',
};

const STEPS = [
  { key: 'PENDING', label: 'Sipariş Alındı' },
  { key: 'PROCESSING', label: 'Hazırlanıyor' },
  { key: 'SHIPPED', label: 'Kargoya Verildi' },
  { key: 'COMPLETED', label: 'Teslim Edildi' },
];

const SUPPORT_SUBJECTS = [
  'Kargo gecikti',
  'Baskı hatası',
  'Yanlış ürün geldi',
  'Eksik ürün',
  'İade talebi',
  'Diğer',
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    RETURNED: 'bg-orange-100 text-orange-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-800'}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function OrderStepper({ status }: { status: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentIndex < 0 ? 0 : currentIndex;

  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const isActive = i <= activeIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isActive ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              <span className={`mt-1 text-[10px] sm:text-xs ${isActive ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-0.5 min-w-[8px] ${i < activeIndex ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [supportModal, setSupportModal] = useState<{ orderId: string; orderLabel: string } | null>(null);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/orders?page=1&pageSize=100', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((data: { orders?: Order[] } | Order[]) => {
        const list = Array.isArray(data) ? data : (data?.orders ?? []);
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter orders based on status
  const activeOrders = orders.filter(order => 
    ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status)
  );
  
  const pastOrders = orders.filter(order => 
    ['COMPLETED', 'CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.status)
  );

  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const handleOpenSupport = (order: Order) => {
    setSupportModal({
      orderId: order.id,
      orderLabel: order.barcode || `#${order.id.slice(-8)}`,
    });
    setSupportSubject('');
    setSupportMessage('');
    setSupportSuccess(false);
  };

  const handleSubmitSupport = async () => {
    if (!supportModal || !supportSubject.trim() || !supportMessage.trim()) return;
    setSupportSending(true);
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId: supportModal.orderId,
          subject: supportSubject,
          message: supportMessage,
        }),
      });
      if (res.ok) {
        setSupportSuccess(true);
        setTimeout(() => {
          setSupportModal(null);
        }, 1500);
      }
    } finally {
      setSupportSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-2">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Siparişlerim</h1>
        <p className="text-gray-500 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Siparişlerim</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'active'
                ? 'border-[#FF6000] text-[#FF6000]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aktif Siparişlerim
            {activeOrders.length > 0 && (
              <span className="ml-2 bg-[#FF6000] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {activeOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'past'
                ? 'border-[#FF6000] text-[#FF6000]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Geçmiş Siparişlerim
            {pastOrders.length > 0 && (
              <span className="ml-2 bg-gray-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {pastOrders.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Orders List */}
      {displayOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-600 text-sm mb-4">
            {activeTab === 'active' 
              ? 'Bu alanda aktif siparişiniz bulunmamaktadır.' 
              : 'Bu alanda geçmiş siparişiniz bulunmamaktadır.'
            }
          </p>
          {activeTab === 'active' && orders.length === 0 && (
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-[#FF6000] hover:bg-[#e55a00] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Alışverişe Başla
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-sm font-mono font-medium text-gray-700">
                    Sipariş No: {order.barcode || order.id.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-[#1e3a8a]">
                    {Number(order.totalAmount).toLocaleString('tr-TR')} TL
                  </span>
                  <Link
                    href={`/hesabim/siparisler/${order.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#FF6000] hover:text-[#e55a00]"
                  >
                    Sipariş Detayı
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Body: products with thumbnails */}
              <div className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item) => {
                    const img = item.imageUrl || '/placeholder-product.svg';
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100"
                      >
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-white flex-shrink-0">
                          <Image
                            src={img}
                            alt={item.productName}
                            fill
                            className="object-contain"
                            sizes="40px"
                          />
                        </div>
                        <span className="text-sm text-gray-800 line-clamp-1 max-w-[180px]">
                          {item.productName}
                          {item.quantity > 1 && (
                            <span className="text-gray-500 ml-1">× {item.quantity}</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stepper */}
              <div className="px-4 py-3 border-t border-gray-100">
                <OrderStepper status={order.status} />
              </div>

              {/* Footer: status + support */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                <StatusBadge status={order.status} />
                <div className="flex items-center gap-3">
                  {order.invoiceUrl && (
                    <a
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <FileDown size={14} />
                      Faturayı İndir
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenSupport(order)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#1e3a8a]"
                  >
                    <Headphones size={14} />
                    Sorun Bildir / Destek Al
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Support modal */}
      {supportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Destek Talebi</h3>
              <button
                type="button"
                onClick={() => !supportSending && setSupportModal(null)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {supportSuccess ? (
                <p className="text-emerald-600 text-sm font-medium">Talebiniz alındı. En kısa sürede dönüş yapacağız.</p>
              ) : (
                <>
                  <p className="text-xs text-gray-500">Sipariş: {supportModal.orderLabel}</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                    <select
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                    >
                      <option value="">Seçiniz</option>
                      {SUPPORT_SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
                    <textarea
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] resize-none"
                      placeholder="Sorununuzu kısaca açıklayın..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSubmitSupport}
                      disabled={supportSending || !supportSubject.trim() || !supportMessage.trim()}
                      className="flex-1 py-2.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1e40af] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {supportSending ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupportModal(null)}
                      disabled={supportSending}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                    >
                      İptal
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
