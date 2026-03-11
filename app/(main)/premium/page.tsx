'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
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
  Package,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PremiumWelcomeModal from './PremiumWelcomeModal';
import SmartQuoteForm from '@/app/components/SmartQuoteForm';

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
  const formRef = useRef<HTMLDivElement>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [selectedProductLoading, setSelectedProductLoading] = useState(false);

  const productId = searchParams.get('productId')?.trim() || null;
  const preferredVendorId = searchParams.get('preferredVendorId')?.trim() || null;
  const productNamePrefill = searchParams.get('productName')?.trim() || null;

  const user = session?.user as { name?: string | null; email?: string | null; companyName?: string | null } | undefined;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Üye';
  const companyName = user?.companyName || null;

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });


  useEffect(() => {
    if (productId) return;
    const t = window.setTimeout(() => {
      router.replace('/urunler?kategori=premium-urunler');
    }, 250);
    return () => window.clearTimeout(t);
  }, [productId, router]);


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
          // selectedProduct set
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

  // SmartQuoteForm handles submission + redirect

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <PremiumWelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />

      <AnimatePresence />

      <section className="px-4 pt-10 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 ${playfair.className}`}>Matbaagross Premium</h1>
              <p className="text-sm text-slate-600 mt-1">Kurumsal üretim talepleri için VIP teklif deneyimi</p>
            </div>
            {productId ? (
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6000] px-5 py-3 text-white font-semibold hover:bg-[#e55a00] transition-colors"
              >
                <Sparkles className="h-5 w-5" />
                Talep Oluştur
              </button>
            ) : (
              <Link
                href="/urunler?kategori=premium-urunler"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6000] px-5 py-3 text-white font-semibold hover:bg-[#e55a00] transition-colors"
              >
                <Sparkles className="h-5 w-5" />
                Ürün Seç
              </Link>
            )}
          </div>
        </div>
      </section>

      <section ref={formRef} className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {!productId ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
              <p className="text-sm text-amber-900 font-semibold">Lütfen teklif almak için bir ürün seçin.</p>
              <p className="text-xs text-amber-800 mt-1">
                Ürün listesine yönlendiriliyorsunuz. Eğer yönlendirme olmazsa{' '}
                <Link href="/urunler?kategori=premium-urunler" className="underline font-semibold">buraya tıklayın</Link>.
              </p>
            </div>
          ) : null}

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

          {productId ? (
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

                <div className="pt-6">
                  <SmartQuoteForm
                    variant="inline"
                    productId={productId}
                    productName={selectedProduct?.name || productNamePrefill || null}
                    minOrderQuantity={null}
                    preferredVendorId={preferredVendorId}
                    successRedirect
                    className="space-y-5"
                  />
                </div>
              </div>
            </div>
            </div>
          ) : null}
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
