'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, FileText, Package, X, Clock, Send, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dakika önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  const days = Math.floor(hrs / 24);
  return `${days} gün önce`;
}

function getBadge(r: { createdAt: string }) {
  const ageHours = (Date.now() - new Date(r.createdAt).getTime()) / 3600000;
  if (ageHours > 168) return { label: 'SÜRESİ DOLDU', cls: 'bg-red-100 text-red-700 border-red-200' };
  if (ageHours < 24) return { label: 'YENİ', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  return { label: 'AÇIK', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
}

export default function TeklifHavuzuPage() {
  const router = useRouter();
  const COMMISSION_RATE = 0.1;
  const [openRequestNo, setOpenRequestNo] = useState<string | null>(null);
  const [unitPriceInput, setUnitPriceInput] = useState<string>('');
  const [totalPriceInput, setTotalPriceInput] = useState<string>('');
  const [deliveryTimeInput, setDeliveryTimeInput] = useState<string>('');
  const [sellerNote, setSellerNote] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Verileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadError(null);
        const res = await fetch('/api/seller/premium-quotes', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setLoadError(typeof data?.error === 'string' ? data.error : 'Veriler alınamadı');
          setRequests([]);
          setOffers([]);
          return;
        }

        setRequests(data?.requests || []);
        setOffers(data?.offers || []);
      } catch (error) {
        console.error('Error loading quotes:', error);
        setLoadError('Veriler alınamadı');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Teklif ekleme fonksiyonu
  const addQuote = async (quoteData: any) => {
    try {
      const res = await fetch('/api/seller/premium-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });
      if (res.ok) {
        const newQuote = await res.json();
        setOffers((prev) => [newQuote, ...prev]);
        // Pool kuralı: teklif verdikten sonra iş havuzdan kaybolur
        setRequests((prev) => prev.filter((r) => r.id !== quoteData.requestId));
        router.push('/seller-dashboard/verilen-teklifler');
      }
    } catch (error) {
      console.error('Error adding quote:', error);
    }
  };

  const rows = useMemo(() => {
    return requests.map((r) => ({
      ...r,
      badge: getBadge(r),
      timeAgoText: r.createdAt ? timeAgo(r.createdAt) : '-',
    }));
  }, [requests]);

  const selectedRequest = useMemo(() => {
    if (!openRequestNo) return null;
    return requests.find((r) => r.requestNo === openRequestNo) ?? null;
  }, [openRequestNo, requests]);

  const selectedSnapshot = useMemo(() => (selectedRequest?.technicalSpecs ?? null) as any, [selectedRequest?.technicalSpecs]);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.matbaagross.com').replace(/\/+$/, '');
  const selectedProductUrl = useMemo(() => {
    const u = selectedSnapshot?.product?.productUrl;
    if (typeof u === 'string' && u.trim()) {
      const v = u.trim();
      return v.startsWith('http') ? v : `${siteUrl}${v.startsWith('/') ? v : `/${v}`}`;
    }
    const pid = selectedRequest?.productId;
    if (typeof pid === 'string' && pid.trim()) return `${siteUrl}/urun/${encodeURIComponent(pid.trim())}`;
    return '';
  }, [selectedSnapshot, selectedRequest?.productId, siteUrl]);
  const selectedThumbUrl = useMemo(() => {
    const u = selectedSnapshot?.product?.imageUrl;
    return typeof u === 'string' && u.trim() ? u.trim() : '';
  }, [selectedSnapshot]);

  const selectedFilePreview = useMemo(() => {
    if (!selectedRequest?.fileUrl) return { isImage: false, url: '' };
    const u = String(selectedRequest.fileUrl);
    const lower = u.toLowerCase();
    const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].some((ext) => lower.includes(ext));
    return { isImage, url: u };
  }, [selectedRequest]);

  const competitionInfo = useMemo(() => {
    if (!openRequestNo) return null;
    const requestOffers = offers.filter((q) => q.requestNo === openRequestNo);
    const offersCount = requestOffers.length;
    const lowest = requestOffers.length
      ? Math.min(...requestOffers.map((q) => Number(q.totalPrice ?? q.price)))
      : null;

    // Demo “rekabet barı”: toplam 10 koltuk varmış gibi davranalım.
    const totalSlots = 10;
    const remainingSlots = Math.max(0, totalSlots - offersCount);

    return {
      offersCount,
      lowest,
      remainingSlots,
    };
  }, [openRequestNo, offers]);

  const parseMoney = (raw: string) => {
    const normalized = raw.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const roundTo = (n: number, digits: number) => {
    const m = 10 ** digits;
    return Math.round(n * m) / m;
  };

  const quantity = useMemo(() => {
    const q = Number(selectedRequest?.quantity);
    return Number.isFinite(q) && q > 0 ? q : null;
  }, [selectedRequest?.quantity]);

  const numericUnitPrice = useMemo(() => parseMoney(unitPriceInput), [unitPriceInput]);
  const numericTotalPrice = useMemo(() => parseMoney(totalPriceInput), [totalPriceInput]);

  const cleanedDeliveryTime = useMemo(() => deliveryTimeInput.trim(), [deliveryTimeInput]);

  const finalPrice = useMemo(() => {
    if (!numericTotalPrice) return null;
    return Math.round(numericTotalPrice * (1 + COMMISSION_RATE));
  }, [numericTotalPrice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">{loadError}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="pointer-events-none absolute -inset-x-10 -top-10 h-64 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.18),rgba(212,175,55,0)_60%)]" />
      <div className="pointer-events-none absolute -inset-x-10 top-20 h-72 bg-[radial-gradient(ellipse_at_center,rgba(255,96,0,0.12),rgba(255,96,0,0)_65%)]" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1020] shadow-lg">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.35),rgba(212,175,55,0)_55%)]" />
        <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <img src="/matbaagross-logo.png" alt="MatbaaGross Premium" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">MatbaaGross Premium • Teklif Havuzu</h1>
              <p className="text-sm text-slate-200/90 mt-0.5">
                Sadece seçkin üreticilere özel, yüksek hacimli talepler burada listelenir.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm text-white">
            <span className="h-2 w-2 rounded-full bg-[#FF6000] shadow-[0_0_0_6px_rgba(255,96,0,0.15)]" />
            Ayrıcalıklar Dünyası
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Talep No</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">
                  Müşteri Talebi &amp; Spesifikasyonlar
                </th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Oluşturulma</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Şu an teklif havuzunda talep yok.</p>
                    <p className="text-gray-400 text-sm mt-1">Yeni talepler geldiğinde burada görünecek.</p>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.requestNo} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                    {/* Talep No + Badge */}
                    <td className="px-4 py-4 align-top w-36">
                      <p className="font-mono text-xs text-gray-500 mb-1.5">{r.requestNo}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${r.badge.cls}`}>
                        {r.badge.label === 'YENİ' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {r.badge.label}
                      </span>
                    </td>

                    {/* Spesifikasyonlar */}
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-bold text-gray-900 mb-1">{r.productName || '-'}</p>
                      {(r.description?.trim() || r.technicalDetails?.trim()) && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {r.description?.trim() || r.technicalDetails?.trim()}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-700">
                          <Package className="h-3.5 w-3.5 text-[#FF6000]" />
                          {typeof r.quantity === 'number' ? r.quantity.toLocaleString('tr-TR') : '-'} adet
                        </span>
                        {r.technicalDetails?.trim() && (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-700">
                            <FileText className="h-3.5 w-3.5 text-slate-500" />
                            Teknik detay mevcut
                          </span>
                        )}
                        {r.fileUrl && (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Dosyayı Gör
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Zaman */}
                    <td className="px-4 py-4 align-top w-32">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs">{r.timeAgoText}</span>
                      </div>
                    </td>

                    {/* Aksiyon */}
                    <td className="px-4 py-4 align-top w-32">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-3 py-2 text-white text-sm font-semibold hover:bg-[#e55a00] transition-colors shadow-sm"
                          onClick={() => {
                            setOpenRequestNo(r.requestNo);
                            setUnitPriceInput('');
                            setTotalPriceInput('');
                            setDeliveryTimeInput('');
                            setSellerNote('');
                          }}
                        >
                          <Send className="h-3.5 w-3.5" />
                          Teklif Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teklif Ver Modal */}
      <AnimatePresence>
        {openRequestNo && selectedRequest && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenRequestNo(null)}
          >
            <motion.div
              className="w-full sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[95vh]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sticky top-0 bg-white z-10">
                <div>
                  <p className="text-xs font-mono text-gray-400">{selectedRequest.requestNo}</p>
                  <div className="mt-0.5 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      {selectedThumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedThumbUrl} alt={selectedRequest.productName} className="h-full w-full object-contain" />
                      ) : (
                        <div className="text-[10px] text-gray-400">Ürün</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-gray-900 truncate">{selectedRequest.productName}</h2>
                      {selectedProductUrl ? (
                        <a
                          href={selectedProductUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-2 text-xs font-extrabold text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          🔗 Ürün Sayfasına Git
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {typeof selectedRequest.quantity === 'number'
                        ? selectedRequest.quantity.toLocaleString('tr-TR')
                        : '-'} adet
                    </span>
                    {competitionInfo && competitionInfo.offersCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {competitionInfo.offersCount} rakip teklif mevcut
                      </span>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => setOpenRequestNo(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-5 py-5 space-y-5">
                {/* Talep bilgileri */}
                {(selectedRequest.description?.trim() || selectedRequest.technicalDetails?.trim()) && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
                    {selectedRequest.description?.trim() && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Açıklama</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedRequest.description}</p>
                      </div>
                    )}
                    {selectedRequest.technicalDetails?.trim() && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Teknik Detay</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedRequest.technicalDetails}</p>
                      </div>
                    )}
                    {selectedRequest.fileUrl && (
                      <a href={selectedRequest.fileUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6000] hover:underline mt-1">
                        <FileText className="h-3.5 w-3.5" /> Ekli dosyayı görüntüle
                      </a>
                    )}
                  </div>
                )}

                {/* Fiyatlandırma */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-800">Fiyat Teklifi</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Birim Fiyat (TL)</label>
                      <input
                        value={unitPriceInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const next = e.target.value;
                          setUnitPriceInput(next);
                          const n = parseMoney(next);
                          if (!quantity || !n) return;
                          setTotalPriceInput(String(roundTo(n * quantity, 2)));
                        }}
                        inputMode="decimal"
                        placeholder="0,00"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Toplam Fiyat (TL) <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={totalPriceInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const next = e.target.value;
                          setTotalPriceInput(next);
                          const n = parseMoney(next);
                          if (!quantity || !n) return;
                          setUnitPriceInput(String(roundTo(n / quantity, 4)));
                        }}
                        inputMode="decimal"
                        placeholder="0,00"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                      />
                    </div>
                  </div>
                  {numericTotalPrice && (
                    <p className="text-xs text-gray-500">
                      Müşteriye gösterilecek fiyat (komisyon dahil):{' '}
                      <span className="font-semibold text-gray-800">
                        {finalPrice?.toLocaleString('tr-TR')} TL
                      </span>
                    </p>
                  )}
                </div>

                {/* Teslimat + Not */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Teslimat Süresi <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={deliveryTimeInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryTimeInput(e.target.value)}
                      placeholder="Örn: 5 iş günü"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Not (İsteğe Bağlı)</label>
                    <input
                      value={sellerNote}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSellerNote(e.target.value)}
                      placeholder="Örn: Mat selefon uygulanır"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  disabled={!numericTotalPrice || !cleanedDeliveryTime}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6000] px-5 py-3 text-white font-bold text-sm hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  onClick={() => setShowConfirmModal(true)}
                >
                  <Send className="h-4 w-4" />
                  Teklif Gönder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onay Modalı */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Send className="h-5 w-5 text-[#FF6000]" />
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center mb-2">Teklifi Gönder</h3>
              <p className="text-sm text-gray-500 text-center mb-1">
                <span className="font-semibold text-gray-800">{numericTotalPrice?.toLocaleString('tr-TR')} TL</span> toplam fiyat teklifi gönderilecek.
              </p>
              <p className="text-xs text-gray-400 text-center mb-6">Teslimat: {cleanedDeliveryTime}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Geri Dön
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-[#FF6000] px-4 py-2.5 text-sm text-white font-bold hover:bg-[#e55a00] transition-colors"
                  onClick={() => {
                    if (!numericTotalPrice || !cleanedDeliveryTime) return;
                    addQuote({
                      requestId: selectedRequest!.id,
                      price: numericTotalPrice,
                      unitPrice: numericUnitPrice,
                      totalPrice: numericTotalPrice,
                      deliveryTime: cleanedDeliveryTime,
                      note: sellerNote.trim(),
                    });
                    setOpenRequestNo(null);
                    setShowConfirmModal(false);
                  }}
                >
                  Onayla ve Gönder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
