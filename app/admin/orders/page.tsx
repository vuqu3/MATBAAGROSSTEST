'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Package, ChevronDown, MapPin, ChevronLeft, ChevronRight, Download, Barcode as BarcodeIcon, Scan } from 'lucide-react';
import Barcode from 'react-barcode';

const PAGE_SIZE = 10;

type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options: unknown;
  uploadedFileUrl?: string | null;
};

type Address = {
  id: string;
  city: string;
  district: string | null;
  line1: string;
  line2: string | null;
  postalCode: string | null;
  title: string | null;
};

type User = {
  id: string;
  email: string;
  name: string | null;
};

type Order = {
  id: string;
  barcode?: string | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user?: User;
  address: Address;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED: 'Kargolandı',
  COMPLETED: 'Tamamlandı',
};

type OrdersResponse = { orders: Order[]; total: number; page: number; pageSize: number };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [barcodeScan, setBarcodeScan] = useState('');
  const [barcodeScanLoading, setBarcodeScanLoading] = useState(false);
  const [barcodeScanMessage, setBarcodeScanMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const barcodePrintRef = useRef<HTMLDivElement>(null);

  const loadOrders = useCallback((pageNum: number) => {
    setLoading(true);
    fetch(`/api/orders?page=${pageNum}&pageSize=${PAGE_SIZE}`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) return { orders: [], total: 0, page: 1, pageSize: PAGE_SIZE };
        return res.json();
      })
      .then((data: OrdersResponse | Order[]) => {
        if (data && typeof data === 'object' && 'orders' in data) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
          setTotal(Number((data as OrdersResponse).total) || 0);
        } else {
          setOrders(Array.isArray(data) ? data : []);
          setTotal(Array.isArray(data) ? data.length : 0);
        }
      })
      .catch(() => {
        setOrders([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadOrders(page);
  }, [page, loadOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      const updated = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
        setExpandedId(null);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBarcodeScan = async () => {
    const code = barcodeScan.trim();
    if (!code) {
      setBarcodeScanMessage({ type: 'err', text: 'Barkod girin veya okutun.' });
      return;
    }
    setBarcodeScanLoading(true);
    setBarcodeScanMessage(null);
    try {
      const res = await fetch('/api/orders/by-barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: code }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setBarcodeScanMessage({ type: 'ok', text: data.message ?? 'Durum güncellendi.' });
        setBarcodeScan('');
        loadOrders(page);
      } else {
        setBarcodeScanMessage({ type: 'err', text: data.error ?? 'İşlem başarısız.' });
      }
    } catch {
      setBarcodeScanMessage({ type: 'err', text: 'Bağlantı hatası.' });
    } finally {
      setBarcodeScanLoading(false);
    }
  };

  const printBarcodeLabel = (order: Order) => {
    setPrintOrder(order);
  };

  useEffect(() => {
    if (!printOrder || !barcodePrintRef.current) return;
    const timer = setTimeout(() => {
      const content = barcodePrintRef.current;
      if (!content) return;
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`
        <!DOCTYPE html><html><head><title>Barkod - ${printOrder.barcode ?? printOrder.id}</title>
        <style>
          body { font-family: Arial,sans-serif; padding: 8px; margin: 0; font-size: 11px; }
          .barcode-wrap { margin: 6px 0; }
          .barcode-wrap svg { max-width: 100%; height: auto; }
          .line { margin: 2px 0; }
          strong { font-size: 12px; }
        </style></head><body>
        ${content.innerHTML}
        </body></html>`);
      win.document.close();
      win.focus();
      win.print();
      win.close();
      setPrintOrder(null);
    }, 100);
    return () => clearTimeout(timer);
  }, [printOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#1e3a8a] mb-4 flex items-center gap-2">
        <Package className="text-[#FF6000]" size={22} />
        Siparişler
      </h1>

      {/* Barkod okut → durum Hazırlanıyor */}
      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-2">
        <Scan className="text-slate-600" size={18} />
        <span className="text-sm font-medium text-slate-700">Barkod okut / gir:</span>
        <input
          type="text"
          value={barcodeScan}
          onChange={(e) => setBarcodeScan(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan()}
          placeholder="MG-2024-XXXXXX"
          className="px-2 py-1.5 border border-slate-300 rounded text-sm w-40 font-mono"
        />
        <button
          type="button"
          onClick={handleBarcodeScan}
          disabled={barcodeScanLoading}
          className="px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded hover:bg-[#1e40af] disabled:opacity-50"
        >
          {barcodeScanLoading ? 'İşleniyor...' : 'Hazırlanıyor yap'}
        </button>
        {barcodeScanMessage && (
          <span className={`text-xs ${barcodeScanMessage.type === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
            {barcodeScanMessage.text}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-600">Henüz sipariş yok.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Sipariş / Tarih</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Müşteri</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Toplam</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Durum</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50"
                    >
                      <td className="py-2 px-3 leading-tight">
                        <span className="font-mono text-xs text-gray-600">{order.id.slice(0, 8)}...</span>
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </td>
                      <td className="py-2 px-3 leading-tight">
                        {order.user ? (
                          <>
                            <span className="font-medium text-gray-900 text-xs">{order.user.name || order.user.email}</span>
                            <br />
                            <span className="text-xs text-gray-500">{order.user.email}</span>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#1e3a8a] text-xs">
                        {Number(order.totalAmount).toLocaleString('tr-TR')} TL
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                            order.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'PROCESSING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-600"
                          aria-label="Detay"
                        >
                          <ChevronDown
                            size={16}
                            className={expandedId === order.id ? 'rotate-180' : ''}
                          />
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-gray-50/80">
                        <td colSpan={5} className="py-3 px-3">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2 space-y-3">
                              <div>
                                <h3 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                                  <MapPin size={12} />
                                  Teslimat Adresi
                                </h3>
                                <p className="text-xs text-gray-600 leading-snug">
                                  {order.address.title && `${order.address.title} — `}
                                  {order.address.line1}
                                  {order.address.line2 && `, ${order.address.line2}`}
                                  <br />
                                  {order.address.district && `${order.address.district}, `}
                                  {order.address.city}
                                  {order.address.postalCode && ` ${order.address.postalCode}`}
                                </p>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs border border-gray-200 rounded overflow-hidden">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="text-left py-1.5 px-2 font-semibold text-gray-700">Ürün</th>
                                      <th className="text-right py-1.5 px-2 font-semibold text-gray-700">Adet</th>
                                      <th className="text-right py-1.5 px-2 font-semibold text-gray-700">Birim</th>
                                      <th className="text-right py-1.5 px-2 font-semibold text-gray-700">Toplam</th>
                                      <th className="text-left py-1.5 px-2 font-semibold text-gray-700">Müşteri Dosyası</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item) => (
                                      <tr key={item.id} className="border-t border-gray-100">
                                        <td className="py-1.5 px-2 text-gray-800">{item.productName}</td>
                                        <td className="py-1.5 px-2 text-right">{item.quantity}</td>
                                        <td className="py-1.5 px-2 text-right">{Number(item.unitPrice).toLocaleString('tr-TR')} TL</td>
                                        <td className="py-1.5 px-2 text-right font-medium">{Number(item.totalPrice).toLocaleString('tr-TR')} TL</td>
                                        <td className="py-1.5 px-2">
                                          {item.uploadedFileUrl ? (
                                            <span className="inline-flex items-center gap-1">
                                              {/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.uploadedFileUrl) ? (
                                                <a href={item.uploadedFileUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-8 h-8 rounded border border-gray-200 overflow-hidden bg-white">
                                                  <img src={item.uploadedFileUrl} alt="" className="w-full h-full object-contain" />
                                                </a>
                                              ) : null}
                                              <a href={item.uploadedFileUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[#1e3a8a] hover:underline">
                                                <Download size={12} /> Dosyayı İndir
                                              </a>
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">—</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-gray-700">Durum güncelle:</span>
                                {(['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED'] as const).map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => updateStatus(order.id, s)}
                                    disabled={updatingId === order.id || order.status === s}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                      order.status === s
                                        ? 'bg-[#1e3a8a] text-white'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {STATUS_LABELS[s]}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center justify-center gap-1">
                                  <BarcodeIcon size={12} />
                                  SİPARİŞ BARKODU
                                </h3>
                                {order.barcode ? (
                                  <>
                                    <p className="font-mono text-sm font-medium text-gray-900 mb-1">{order.barcode}</p>
                                    <div className="flex justify-center my-2">
                                      <Barcode value={order.barcode} height={32} margin={0} fontSize={10} />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => printBarcodeLabel(order)}
                                      className="mt-2 w-full py-1.5 px-2 bg-slate-700 text-white text-xs font-medium rounded hover:bg-slate-800"
                                    >
                                      Barkod Yazdır
                                    </button>
                                  </>
                                ) : (
                                  <p className="text-xs text-gray-500">Eski sipariş — barkod yok</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm text-gray-600">
                Toplam <span className="font-medium">{total}</span> sipariş, sayfa{' '}
                <span className="font-medium">{page}</span> / {Math.ceil(total / PAGE_SIZE)}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Önceki
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(Math.ceil(total / PAGE_SIZE), p + 1))}
                  disabled={page >= Math.ceil(total / PAGE_SIZE)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gizli: Barkod yazdırma içeriği (termal etiket) */}
      {printOrder && (
        <div ref={barcodePrintRef} className="absolute left-[-9999px] top-0">
          <div className="line"><strong>Sipariş Barkodu</strong></div>
          {printOrder.barcode && (
            <div className="barcode-wrap">
              <Barcode value={printOrder.barcode} height={36} margin={0} fontSize={10} />
            </div>
          )}
          <div className="line">Sipariş: #{printOrder.id.slice(-8)}</div>
          <div className="line">Tarih: {new Date(printOrder.createdAt).toLocaleString('tr-TR')}</div>
          <div className="line">Toplam: {Number(printOrder.totalAmount).toLocaleString('tr-TR')} TL</div>
        </div>
      )}
    </div>
  );
}
