'use client';

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import {
  FileText,
  Users,
  CheckCircle,
  Check,
  Sparkles,
  Truck,
  RotateCcw,
  Palette,
  Upload,
  Package,
  PhoneCall,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PremiumWelcomeModal from './PremiumWelcomeModal';
import { useOffers } from '@/context/OffersContext';

const MIDNIGHT = '#0f172a';
const GOLD = '#d4af37';
const GOLD_LIGHT = '#f5e6c8';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
});

type SelectedProduct = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

function PremiumPageInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addRequest } = useOffers();
  const formRef = useRef<HTMLDivElement>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<{ dataUrl: string; mime: string } | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdRequestNo, setCreatedRequestNo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [selectedProductLoading, setSelectedProductLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    productTitle: '',
    quantity: '',
    requestSummary: '',
    technicalDetails: '',
    needExpertCall: false,
  });

  const productId = searchParams.get('productId')?.trim() || null;

  const user = session?.user as { name?: string | null; email?: string | null; companyName?: string | null } | undefined;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Üye';
  const companyName = user?.companyName || null;

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });


  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!productId) {
        setSelectedProduct(null);
        return;
      }
      setSelectedProductLoading(true);
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, { cache: 'no-store' });
        if (!res.ok) {
          if (!cancelled) setSelectedProduct(null);
          return;
        }
        const data = (await res.json()) as any;
        const next: SelectedProduct = {
          id: String(data.id),
          name: String(data.name ?? ''),
          imageUrl: (data.imageUrl ?? null) as string | null,
        };
        if (!cancelled) {
          setSelectedProduct(next);
          if (next.name) {
            setForm((f) => ({ ...f, productTitle: f.productTitle || next.name }));
          }
        }
      } catch {
        if (!cancelled) setSelectedProduct(null);
      } finally {
        if (!cancelled) setSelectedProductLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (file.type?.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = typeof reader.result === 'string' ? reader.result : null;
          if (dataUrl) setUploadedPreview({ dataUrl, mime: file.type });
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedPreview(null);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (file.type?.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = typeof reader.result === 'string' ? reader.result : null;
          if (dataUrl) setUploadedPreview({ dataUrl, mime: file.type });
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedPreview(null);
      }
    }
  };

  const generateRequestNo = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `MG-${dd}${mm}${yy}-${rand}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    const requestNo = generateRequestNo();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const productGroup = form.requestSummary?.trim() ? form.requestSummary.trim().slice(0, 48) : 'Premium Talep';
    const quantity = Number(form.quantity);

    addRequest({
      requestNo,
      productGroup,
      productTitle: form.productTitle,
      requestSummary: form.requestSummary,
      technicalDetails: form.technicalDetails,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : undefined,
      attachment: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size } : null,
      attachmentDataUrl: uploadedPreview?.dataUrl,
      attachmentMime: uploadedPreview?.mime,
      expiresAt,
    });

    try {
      let fileUrl: string | null = null;
      if (uploadedFile) {
        const fd = new FormData();
        fd.append('file', uploadedFile);
        const resUpload = await fetch('/api/upload/customer-file', {
          method: 'POST',
          body: fd,
        });
        const uploadData = await resUpload.json().catch(() => ({}));
        if (!resUpload.ok) {
          throw new Error(uploadData?.error || 'Dosya yüklenemedi');
        }
        fileUrl = typeof uploadData?.url === 'string' ? uploadData.url : null;
      }

      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestNo,
          productId: productId || undefined,
          productName: form.productTitle,
          quantity: Number.isFinite(quantity) ? quantity : undefined,
          description: form.requestSummary,
          technicalDetails: form.technicalDetails,
          fileUrl: fileUrl || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Talep kaydedilemedi');
      }

      setCreatedRequestNo(String(data?.requestNo || requestNo));
      setSuccessOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Talep kaydedilemedi');
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <PremiumWelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />

      <AnimatePresence>
        {successOpen && createdRequestNo && (
          <motion.div
            key="premium-success-modal"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-success-title"
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              aria-hidden="true"
              onClick={() => {
                setSuccessOpen(false);
                setCopied(false);
              }}
            />

            <motion.div
              className="relative w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl p-6"
              initial={{ y: 12, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h2 id="premium-success-title" className="text-lg font-bold text-gray-900">
                    Talebiniz Başarıyla Oluşturuldu!
                  </h2>

                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Talep Numaranız</p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        className="font-mono font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(createdRequestNo);
                            setCopied(true);
                            window.setTimeout(() => setCopied(false), 1500);
                          } catch {
                            // clipboard izin yoksa sessiz geç
                          }
                        }}
                      >
                        {createdRequestNo}
                      </button>
                      <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                        <Copy className="h-3.5 w-3.5" />
                        {copied ? 'Kopyalandı' : 'Kopyalamak için tıkla'}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                    Talebinizi ve gelen teklifleri profilinizde bulunan <span className="font-semibold">"MatbaaGross Premium"</span> sekmesinden anlık olarak takip edebilirsiniz. Teklifler hazır olduğunda size bildirim göndereceğiz.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSuccessOpen(false);
                        setCopied(false);
                      }}
                    >
                      Kapat
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-[#FF6000] text-white font-semibold hover:bg-[#e55a00] transition-colors"
                      onClick={() => {
                        setSuccessOpen(false);
                        setCopied(false);
                        router.push('/hesabim/premium-islerim');
                      }}
                    >
                      Premium Paneline Git
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="px-4 pt-10 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 ${playfair.className}`}>Matbaagross Premium</h1>
              <p className="text-sm text-slate-600 mt-1">Kurumsal üretim talepleri için VIP teklif deneyimi</p>
            </div>
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6000] px-5 py-3 text-white font-semibold hover:bg-[#e55a00] transition-colors"
            >
              <Sparkles className="h-5 w-5" />
              Talep Oluştur
            </button>
          </div>
        </div>
      </section>

      <section ref={formRef} className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {!isAuthenticated ? (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
              <p className="text-sm text-amber-900">
                Misafir olarak teklif talebi oluşturuyorsunuz. Taleplerinizi daha sonra takip edebilmek için{' '}
                <Link href="/giris" className="font-semibold underline underline-offset-2">giriş yapabilirsiniz</Link>.
              </p>
            </div>
          ) : (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm text-slate-700">
                Hesabınızla talep oluşturuyorsunuz: <span className="font-semibold text-slate-900">{displayName}</span>
                {companyName ? (
                  <> <span className="text-slate-400">|</span> <span className="font-medium text-slate-800">{companyName}</span></>
                ) : null}
              </p>
              <Link href="/hesabim" className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline">
                Bilgileri Güncelle
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              {(selectedProductLoading || selectedProduct) && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">Seçilen Ürün</h3>
                  </div>
                  <div className="p-6 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0">
                      {selectedProduct?.imageUrl ? (
                        <Image
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Ürün</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {selectedProductLoading ? 'Yükleniyor...' : selectedProduct?.name}
                      </p>
                      {productId && <p className="text-xs text-slate-500 truncate">ID: {productId}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-white to-slate-100 border border-slate-200 shadow-xl rounded-[2rem] p-8">
                <p className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">Matbaagross Premium Güvencesi</p>
                <div className="w-12 h-1 bg-orange-500 rounded-full my-4" />
                <p className="text-sm text-slate-700 leading-relaxed">
                  Matbaagross, kurumsal üretim taleplerinizi doğrulanmış üreticilerle buluşturur. Sağdaki hızlı form ile saniyeler içinde talep bırakın.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: FileText, title: 'Talebinizi Oluşturun', desc: 'İhtiyacınızı sisteme girin' },
                    { icon: Users, title: 'Teklifleri Karşılaştırın', desc: '100+ üreticiden fiyat' },
                    { icon: ShieldCheck, title: 'Güvenli Ödeme', desc: 'Matbaagross güvencesi' },
                    { icon: Truck, title: 'Üretim & Teslimat', desc: 'Kapınıza kadar teslim' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div
                      key={title}
                      className="rounded-2xl bg-white/70 border border-slate-200 p-4 transition-all duration-200 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-50 text-orange-500 p-3 rounded-2xl flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-gray-100">
                <div className="pb-6 border-b border-slate-100">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">Hızlı Teklif Formu</h2>
                  <p className="text-sm text-slate-600 mt-2">Tek ekranda doldurun, hemen teklif isteyin</p>
                </div>

                <form onSubmit={handleSubmit} className="pt-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Ürün İsmi / Başlığı</label>
                      <input
                        required
                        value={form.productTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setForm((f) => ({ ...f, productTitle: e.target.value }))
                        }
                        readOnly={Boolean(productId && selectedProduct?.name)}
                        className="mt-2 w-full bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl px-5 py-4 transition-all duration-200"
                        placeholder="Örn: Lüks Parfüm Kutusu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Adet</label>
                      <input
                        required
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={form.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setForm((f) => ({ ...f, quantity: e.target.value }))
                        }
                        className="mt-2 w-full bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl px-5 py-4 transition-all duration-200"
                        placeholder="Örn: 1000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">İhtiyacınızı Kısaca Yazın</label>
                    <textarea
                      required
                      value={form.requestSummary}
                      onChange={(e) => setForm((f) => ({ ...f, requestSummary: e.target.value }))}
                      rows={3}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl px-5 py-4 transition-all duration-200"
                      placeholder="Örn: 10.000 adet logolu pizza kutusu veya 5.000 adet 7oz karton bardak..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">Teknik Detaylar</label>
                    <textarea
                      value={form.technicalDetails}
                      onChange={(e) => setForm((f) => ({ ...f, technicalDetails: e.target.value }))}
                      rows={2}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl px-5 py-4 transition-all duration-200"
                      placeholder="Ebat, kağıt tipi, selefon vb. (opsiyonel)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">Dosya/Logo Yükleme</label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`mt-2 rounded-2xl border-2 border-dashed p-6 transition-colors ${
                        dragActive ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*,.pdf,.ai,.eps,.psd"
                        onChange={handleFileInput}
                        className="hidden"
                        id="premium-file-upload"
                      />
                      <label htmlFor="premium-file-upload" className="cursor-pointer block">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <Upload className="h-5 w-5 text-slate-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {uploadedFile ? uploadedFile.name : 'Dosyayı sürükleyin veya tıklayın'}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">PDF/AI/EPS/PSD veya görsel dosyaları</p>
                          </div>
                        </div>
                      </label>

                      {uploadedFile ? (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                            onClick={() => {
                              setUploadedFile(null);
                              setUploadedPreview(null);
                            }}
                          >
                            Dosyayı kaldır
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg rounded-xl py-5 shadow-lg shadow-orange-500/30 transform transition hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Gönderiliyor...' : 'Hemen Teklif İste'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neden Premium */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className={`text-3xl font-extrabold tracking-tight text-center mb-10 text-slate-900 ${playfair.className}`}
          >
            Neden Matbaagross Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                title: 'Hızlı Üretim',
                desc: 'Toptan siparişlerinizde kısa teslimat süreleri.',
              },
              {
                icon: RotateCcw,
                title: '%100 İade Garantisi',
                desc: 'Kalite memnuniyetiniz garanti altında.',
              },
              {
                icon: Palette,
                title: 'Grafik Tasarım Desteği',
                desc: 'Ücretsiz tasarım ve uyarlama desteği.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm"
              >
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-orange-50 border border-orange-100"
                >
                  <Icon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>    </div>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PremiumPageInner />
    </Suspense>
  );
}
