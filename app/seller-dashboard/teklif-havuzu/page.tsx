'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, FileText, Package, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function TeklifHavuzuPage() {
  const router = useRouter();
  const { data: session } = useSession();
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

  // Mevcut satıcının vendorId'si (session'dan gelecek)
  const currentVendorId = session?.user?.id;

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

        console.log('Bulunan Talepler:', data?.requests);
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
        // Request listesini güncelle
        setRequests((prev) => prev.map((r) => (r.id === quoteData.requestId ? { ...r, hasQuoted: true } : r)));
        router.push('/seller-dashboard/verilen-teklifler');
      }
    } catch (error) {
      console.error('Error adding quote:', error);
    }
  };

  const rows = useMemo(() => {
    return requests.map((r) => ({
      ...r,
      createdAtText: r.createdAt ? new Date(r.createdAt).toLocaleString('tr-TR') : '-',
    }));
  }, [requests]);

  const selectedRequest = useMemo(() => {
    if (!openRequestNo) return null;
    return requests.find((r) => r.requestNo === openRequestNo) ?? null;
  }, [openRequestNo, requests]);

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
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    Şu an teklif havuzunda talep yok.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.requestNo} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{r.requestNo}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Talep Özeti</p>
                            <p className="mt-0.5 text-sm font-semibold text-gray-900 truncate">
                              {(r.description?.trim() || r.technicalDetails?.trim() || r.productName || '-')
                                .toString()
                                .slice(0, 120)}
                              {((r.description?.trim() || r.technicalDetails?.trim() || r.productName || '').toString().length || 0) >
                              120
                                ? '...'
                                : ''}
                            </p>
                          </div>
                          <div className="hidden sm:flex shrink-0 items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
                            <Package className="h-4 w-4 text-[#FF6000]" />
                            Premium Talep
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                            <FileText className="h-4 w-4 text-gray-700" />
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-500 font-semibold">Ürün</p>
                              <p className="text-xs font-semibold text-gray-900 truncate">{r.productName || '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                            <Package className="h-4 w-4 text-gray-700" />
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-500 font-semibold">Adet</p>
                              <p className="text-xs font-semibold text-gray-900 truncate">
                                {typeof r.quantity === 'number' ? r.quantity.toLocaleString('tr-TR') : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{r.createdAtText}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-3 py-2 text-white font-semibold hover:bg-[#e55a00] transition-colors"
                          onClick={() => {
                            setOpenRequestNo(r.requestNo);
                            setUnitPriceInput('');
                            setTotalPriceInput('');
                            setDeliveryTimeInput('');
                            setSellerNote('');
                          }}
                        >
                          <FileText className="h-4 w-4" />
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

      <AnimatePresence>
        {openRequestNo && selectedRequest && competitionInfo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenRequestNo(null)}
          >
            <motion.div
              className="w-full max-w-5xl rounded-2xl bg-white shadow-xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold text-[#FF6000]">Sizin için seçilen özel talep</p>
                  <h2 className="text-lg font-bold text-gray-900">
                    Talep: <span className="font-mono">{selectedRequest.requestNo}</span>
                  </h2>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedRequest.productName}</p>
                </div>

                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                  onClick={() => setOpenRequestNo(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                      {selectedFilePreview.isImage ? (
                        <img
                          src={selectedFilePreview.url}
                          alt="Müşteri dosyası"
                          className="w-full h-48 object-contain"
                        />
                      ) : (
                        <div className="h-48 flex items-center justify-center text-sm font-semibold text-gray-500">
                          Dosya önizlemesi yok
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Müşteri Görseli</p>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                      <p className="text-sm font-bold text-gray-900">Talep Detayları</p>

                      <div className="mt-3 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm text-gray-600">Ürün</p>
                          <p className="text-sm font-semibold text-gray-900 text-right">{selectedRequest.productName || '-'}</p>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm text-gray-600">Adet</p>
                          <p className="text-sm font-semibold text-gray-900 text-right">
                            {typeof selectedRequest.quantity === 'number'
                              ? selectedRequest.quantity.toLocaleString('tr-TR')
                              : '-'}
                          </p>
                        </div>

                        {selectedRequest.technicalDetails?.trim() ? (
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-xs font-semibold text-gray-600">Teknik Detay</p>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap mt-1">
                              {selectedRequest.technicalDetails}
                            </p>
                          </div>
                        ) : null}

                        {selectedRequest.description?.trim() ? (
                          <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <p className="text-xs font-semibold text-gray-600">Talep Özeti</p>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap mt-1">{selectedRequest.description}</p>
                          </div>
                        ) : null}

                        {selectedRequest.fileUrl ? (
                          <div>
                            <a
                              href={selectedRequest.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-[#FF6000] hover:underline"
                            >
                              Ekli Dosyayı İncele
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900">
                            Şu an {competitionInfo.offersCount} firma teklif verdi, son {Math.min(2, competitionInfo.remainingSlots)} koltuk!
                          </p>
                          <p className="text-sm text-amber-800 mt-1">
                            Rekabet yüksek. Hızlı ve rekabetçi fiyatla öne çıkabilirsiniz.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                      <p className="text-sm text-gray-600">Şu anki En Düşük Fiyat</p>
                      <p className="text-3xl font-extrabold text-gray-900 mt-1">
                        {competitionInfo.lowest === null ? 'Yok' : `${competitionInfo.lowest.toLocaleString('tr-TR')} TL`}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Müşteriye gidecek son fiyat (komisyon dahil):{' '}
                        <span className="font-semibold text-gray-800">
                          {finalPrice === null ? '-' : `${finalPrice.toLocaleString('tr-TR')} TL`}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800">Fiyatlandırma</label>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700">Birim Fiyat (TL)</label>
                              <input
                                value={unitPriceInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const next = e.target.value;
                                  setUnitPriceInput(next);
                                  const n = parseMoney(next);
                                  if (!quantity || !n) return;
                                  const t = roundTo(n * quantity, 2);
                                  setTotalPriceInput(String(t));
                                }}
                                inputMode="decimal"
                                placeholder="Örn: 0,10"
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-orange-200"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700">Toplam Fiyat (TL)</label>
                              <input
                                value={totalPriceInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const next = e.target.value;
                                  setTotalPriceInput(next);
                                  const n = parseMoney(next);
                                  if (!quantity || !n) return;
                                  const u = roundTo(n / quantity, 4);
                                  setUnitPriceInput(String(u));
                                }}
                                inputMode="decimal"
                                placeholder="Örn: 1500"
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-orange-200"
                              />
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Adet: <span className="font-semibold text-gray-800">{quantity ? quantity.toLocaleString('tr-TR') : '-'}</span>
                          </p>
                          <input
                            value=""
                            readOnly
                            className="hidden"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-800">Teslimat Süresi</label>
                            <input
                              value={deliveryTimeInput}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryTimeInput(e.target.value)}
                              placeholder="Örn: 5 iş günü"
                              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-orange-200"
                            />
                          </div>
                          <div className="flex-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800">Satıcı Notu</label>
                          <textarea
                            value={sellerNote}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSellerNote(e.target.value)}
                            rows={3}
                            placeholder="Örn: Üst kalite selefon kullanılacaktır"
                            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-orange-200"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={!numericTotalPrice || !cleanedDeliveryTime}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6000] px-4 py-3 text-white font-extrabold hover:bg-[#e55a00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => setShowConfirmModal(true)}
                        >
                          Teklifi Ateşle
                        </button>

                        <p className="text-xs text-gray-600">
                          Premium üyeliğiniz kapsamında bugünkü sınırsız teklif verme hakkınız tanımlanmıştır.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-white shadow-xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Teklif Onayı</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Verdiğiniz teklif müşteri tarafından görüntülenecek. Lütfen fiyatlarınızı ve maliyetlerinizi kontrol edin. Onaylıyor musunuz?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-lg bg-[#FF6000] px-4 py-2 text-white font-semibold hover:bg-[#e55a00] transition-colors"
                    onClick={() => {
                      if (!numericTotalPrice) return;
                      if (!cleanedDeliveryTime) return;
                      addQuote({
                        requestId: selectedRequest!.id,
                        price: numericTotalPrice,
                        unitPrice: numericUnitPrice,
                        totalPrice: numericTotalPrice,
                        deliveryTime: cleanedDeliveryTime,
                        note: sellerNote.trim() ? sellerNote.trim() : '',
                      });
                      setOpenRequestNo(null);
                      setShowConfirmModal(false);
                    }}
                  >
                    Onayla
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
