'use client';

import { useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Lock,
  Factory,
  Package,
  PhoneCall,
  Copy,
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

export default function PremiumPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  const [form, setForm] = useState({
    productTitle: '',
    quantity: '',
    requestSummary: '',
    technicalDetails: '',
    needExpertCall: false,
  });

  const user = session?.user as { name?: string | null; email?: string | null; companyName?: string | null } | undefined;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Üye';
  const companyName = user?.companyName || null;

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    const payload = {
      ...form,
      requestNo,
      userId: session?.user?.email,
      displayName,
      companyName,
      file: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size } : null,
      preview: uploadedPreview ? { mime: uploadedPreview.mime } : null,
    };
    console.log('Premium teklif formu:', payload);

    setCreatedRequestNo(requestNo);
    setSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
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
      {/* Hero */}
      <section
        className="relative min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${MIDNIGHT} 0%, #1e293b 50%, #0c1222 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <p
            className="text-sm uppercase tracking-[0.3em] mb-4 font-medium"
            style={{ color: GOLD }}
          >
            Kurumsal Teklif
          </p>
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 ${playfair.className}`}
          >
            Markanızın İmzasını Taşıyan Ambalajlar
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Toptan alımlarda özel iskonto, ücretsiz tasarım desteği ve firmanıza özel üretim
            çözümleri.
          </p>
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white transition-all hover:opacity-95 hover:scale-[1.02]"
            style={{ backgroundColor: GOLD }}
          >
            <Sparkles className="h-5 w-5" />
            Hemen Teklif Al
          </button>
        </div>
      </section>

      {/* Nasıl Çalışır — üreticiler yarışıyor konsepti */}
      <section className="py-16 px-4 bg-slate-50/80 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <h2
            className={`text-2xl sm:text-3xl font-bold text-center mb-12 ${playfair.className}`}
            style={{ color: MIDNIGHT }}
          >
            Nasıl Çalışır?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: FileText,
                title: 'Talebini Oluştur',
                desc: 'İhtiyacın olan ürünü, özellikleri ve logonuzu sisteme yükleyin. Talebiniz anında işleme alınsın.',
              },
              {
                step: 2,
                icon: Users,
                title: 'Üretici Ağı Devreye Girsin',
                desc: "Sistemimizdeki 100+ onaylı üretici talebinizi görüntüler ve size en iyi fiyatı vermek için rekabet eder.",
              },
              {
                step: 3,
                icon: CheckCircle,
                title: 'En İyi Fiyatla Anla',
                desc: 'Matbaagross güvencesiyle filtrelenen en avantajlı teklifi panelinizden onaylayın, üretim hemen başlasın.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                  style={{ backgroundColor: MIDNIGHT }}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: GOLD }}>
                  Adım {step}
                </p>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aksiyon alanı: Başlık hero + Form veya Giriş kilidi */}
      <section ref={formRef} className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Centered Hero: Güven rozeti + Ana başlık + Alt açıklama */}
          <div className="relative text-center mb-10 rounded-2xl py-10 px-4 bg-gradient-to-b from-amber-50/50 via-white to-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/50 bg-amber-50/80 mb-6">
              <Factory className="h-3.5 w-3.5 text-amber-600" strokeWidth={2} />
              <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-700 uppercase">
                100+ ONAYLI ÜRETİCİ GÜCÜ
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 ${playfair.className}`}>
              Markanıza Değer Katan, Size Özel Üretim Çözümleri
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Sizin için 100&apos;den fazla onaylı üreticiyi bir araya getirdik. Taleplerinizi uzman ekibimizle{' '}
              <span className="font-semibold text-amber-600">analiz</span> ediyor,{' '}
              <span className="font-semibold text-slate-800">Matbaagross Güvencesi</span>yle markanıza{' '}
              <span className="font-semibold text-amber-600">en uygun teklifi</span> tek bir noktadan sunuyoruz. Fiyat araştırma zahmetine son.
            </p>
          </div>

          {!isAuthenticated ? (
            /* Giriş yapmamış: blur + kilit CTA kartı */
            <div className="relative rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-slate-100/60 backdrop-blur-[2px]" aria-hidden="true" />
              <div className="relative p-8 sm:p-10 text-center">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-amber-100 text-amber-600">
                  <Lock className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className={`text-xl font-bold text-slate-900 mb-2 ${playfair.className}`}>
                  Giriş Gerekli
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto mb-6">
                  Üreticilerden gelen teklifleri görmek ve size özel fiyatlarla sipariş vermek için giriş yapın.
                </p>
                <Link
                  href="/giris"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-95"
                  style={{ backgroundColor: MIDNIGHT }}
                >
                  Giriş Yap veya Kayıt Ol
                </Link>
                <p className="text-xs text-slate-500 mt-4">
                  Hesabınız yoksa <Link href="/kayit-ol" className="text-amber-600 font-medium hover:underline">kayıt olun</Link>.
                </p>
              </div>
            </div>
          ) : (
            <>
          {/* Profil özeti — giriş yapmış kullanıcı */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-semibold text-slate-900 mb-2">Ürün İsmi / Başlığı</label>
                <input
                  required
                  value={form.productTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, productTitle: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-slate-900 placeholder:text-slate-400"
                  placeholder="Örn: Lüks Parfüm Kutusu"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-slate-900 mb-2">Adet</label>
                <input
                  required
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={form.quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-slate-900 placeholder:text-slate-400"
                  placeholder="Örn: 1000"
                />
              </div>
            </div>

            {/* İhtiyacınızı kısaca yazın */}
            <div>
              <label className="block text-base font-semibold text-slate-900 mb-2">İhtiyacınızı Kısaca Yazın</label>
              <textarea
                required
                value={form.requestSummary}
                onChange={(e) => setForm((f) => ({ ...f, requestSummary: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-slate-900 placeholder:text-slate-400"
                placeholder="Örn: 10.000 adet logolu pizza kutusu veya 5.000 adet 7oz karton bardak..."
              />
            </div>

            {/* Ürün detayları ve teknik özellikler */}
            <div>
              <label className="block text-base font-semibold text-slate-900 mb-2">Ürün Detayları ve Varsa Teknik Özellikler</label>
              <textarea
                value={form.technicalDetails}
                onChange={(e) => setForm((f) => ({ ...f, technicalDetails: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-slate-900 placeholder:text-slate-400"
                placeholder="Ebat, Kağıt Tipi, Selefon vb. detayları yazınız"
              />

              {/* Dosya yükleme */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Ürün Fotoğrafı veya Logo Yükle</label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    dragActive ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 bg-slate-50/50'
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
                    <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    {uploadedFile ? (
                      <p className="text-sm font-medium text-slate-700">{uploadedFile.name}</p>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Dosyayı sürükleyin veya <span className="text-amber-600 font-medium">tıklayarak seçin</span>
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Teknik detayı bilmiyorum / Numune — CTA kutuları */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">Teknik detayları bilmiyor musunuz?</p>

              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-amber-200 bg-white cursor-pointer transition-colors has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50/30">
                <input
                  type="checkbox"
                  checked={form.needExpertCall}
                  onChange={(e) => setForm((f) => ({ ...f, needExpertCall: e.target.checked }))}
                  className="mt-1 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-amber-600" />
                    Teknik Detayları Bilmiyorum
                  </span>
                  <p className="text-sm text-slate-600 mt-1">
                    Sadece talebinizi oluşturun; Matbaagross uzman ekibi ürününüzü analiz etmek için sizinle iletişime geçsin.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white transition-all hover:opacity-95"
              style={{ backgroundColor: MIDNIGHT }}
            >
              Talebi Gönder
            </button>
          </form>
            </>
          )}
        </div>
      </section>

      {/* Neden Premium */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className={`text-2xl font-bold text-center mb-10 ${playfair.className}`}
            style={{ color: MIDNIGHT }}
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
                className="text-center p-6 rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: GOLD_LIGHT, color: MIDNIGHT }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>    </div>
  );
}
